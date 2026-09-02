import { randomUUID } from 'crypto';
import { supabase } from './supabase.js';

const models = new Map();

function matches(document, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$or') return expected.some(option => matches(document, option));
    const actual = document[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      return Object.entries(expected).every(([operator, value]) => {
        if (operator === '$options') return true;
        if (operator === '$in') return value.some(item => String(item) === String(actual));
        if (operator === '$nin') return !value.some(item => String(item) === String(actual));
        if (operator === '$gte') return actual >= value;
        if (operator === '$lte') return actual <= value;
        if (operator === '$gt') return actual > value;
        if (operator === '$lt') return actual < value;
        if (operator === '$exists') return value ? actual !== undefined : actual === undefined;
        if (operator === '$regex') return new RegExp(value, expected.$options || '').test(actual || '');
        return String(actual) === String(value);
      });
    }
    return String(actual) === String(expected);
  });
}

class Query {
  constructor(model, filter = {}) {
    this.model = model;
    this.filter = filter;
    this.operations = [];
    this.populateFields = [];
    this.single = false;
  }

  populate(path, select) { this.populateFields.push({ path, select }); return this; }
  sort(value) { this.operations.push({ type: 'sort', value }); return this; }
  skip(value) { this.operations.push({ type: 'skip', value }); return this; }
  limit(value) { this.operations.push({ type: 'limit', value }); return this; }
  select(value) { this.operations.push({ type: 'select', value }); return this; }
  lean() { return this; }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
  catch(reject) { return this.execute().catch(reject); }

  async execute() {
    let documents = await this.model._all();
    documents = documents.filter(document => matches(document, this.filter));
    for (const operation of this.operations) {
      if (operation.type === 'sort') {
        const [[field, direction]] = Object.entries(operation.value);
        documents.sort((left, right) => (left[field] > right[field] ? direction : left[field] < right[field] ? -direction : 0));
      }
      if (operation.type === 'skip') documents = documents.slice(Number(operation.value));
      if (operation.type === 'limit') documents = documents.slice(0, Number(operation.value));
      if (operation.type === 'select' && typeof operation.value === 'string' && operation.value.startsWith('-')) {
        const excluded = operation.value.slice(1).split(' ');
        documents = documents.map(document => Object.fromEntries(Object.entries(document).filter(([key]) => !excluded.includes(key))));
      }
    }
    for (const { path, select } of this.populateFields) {
      const related = models.get(path === 'departmentId' ? 'Department' : path === 'citizenId' || path === 'officerId' || path === 'userId' || path === 'createdBy' || path === 'uploadedBy' || path === 'createdByName' ? 'User' : path);
      if (!related) continue;
      const fields = select ? select.split(' ') : null;
      for (const document of documents) {
        const id = document[path]?._id || document[path];
        const match = id && await related.findById(id);
        if (match) document[path] = fields ? Object.fromEntries(Object.entries(match).filter(([key]) => fields.includes(key) || key === '_id')) : match;
      }
    }
    return this.single ? documents[0] || null : documents;
  }
}

export function createSupabaseModel(name, table) {
  class Model {
    static modelName = name;
    static table = table;

    static async _all() {
      const { data, error } = await supabase.from(table).select('id,data');
      if (error) throw error;
      return (data || []).map(row => new this({ ...row.data, _id: row.id }));
    }

    static find(filter = {}) { return new Query(this, filter); }
    static findOne(filter = {}) {
      const query = new Query(this, filter);
      query.single = true;
      return query.limit(1);
    }
    static findById(id) { return this.findOne({ _id: id }); }
    static async create(input) {
      if (Array.isArray(input)) return Promise.all(input.map(item => this.create(item)));
      const document = new this({ ...input, _id: input._id || randomUUID() });
      const { error } = await supabase.from(table).insert({ id: document._id, data: { ...document } });
      if (error) throw error;
      return document;
    }

    static async _saveDocument(doc) {
      if (!doc || !doc._id) throw new Error('Cannot save document without _id');
      doc.updatedAt = new Date();
      const plainData = { ...doc };
      const { error } = await supabase.from(table).upsert({ id: doc._id, data: plainData });
      if (error) throw error;
      return doc;
    }

    static async countDocuments(filter = {}) { return (await this.find(filter)).length; }
    static async deleteMany(filter = {}) {
      const rows = await this.find(filter);
      if (!rows.length) return;
      const { error } = await supabase.from(table).delete().in('id', rows.map(row => row._id));
      if (error) throw error;
    }
    static async findByIdAndUpdate(id, update, options = {}) {
      let document = await this.findById(id);
      if (!document && options.upsert) return this.create({ ...update, _id: id });
      if (!document) return null;
      Object.assign(document, update);
      await this._saveDocument(document);
      return document;
    }
    static async findOneAndUpdate(filter, update, options = {}) {
      const document = await this.findOne(filter);
      if (document) {
        Object.assign(document, update);
        await this._saveDocument(document);
        return document;
      }
      if (options.upsert) return this.create({ ...filter, ...update });
      return null;
    }
    static async findByIdAndDelete(id) {
      const document = await this.findById(id);
      if (document) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
      }
      return document;
    }

    static async updateMany(filter, update) {
      const documents = await this.find(filter);
      for (const doc of documents) {
        Object.assign(doc, update);
        await this._saveDocument(doc);
      }
      return { modifiedCount: documents.length };
    }

    constructor(data) { Object.assign(this, data); }
    async save() {
      return this.constructor._saveDocument(this);
    }
    async deleteOne() {
      const { error } = await supabase.from(table).delete().eq('id', this._id);
      if (error) throw error;
    }
  }
  models.set(name, Model);
  return Model;
}