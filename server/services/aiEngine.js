// CivicPulse AI Intelligence Engine
// Deterministic, rule-based system — no external API dependencies

const CATEGORY_DEPARTMENT_MAP = {
  'Roads': 'Roads & Infrastructure',
  'Streetlights': 'Electrical Department',
  'Garbage': 'Sanitation Department',
  'Water': 'Water Supply Department',
  'Drainage': 'Drainage & Sewage Department',
  'Traffic': 'Traffic Management',
  'Public Safety': 'Public Safety Department',
  'Parks': 'Parks & Recreation',
  'Public Buildings': 'Public Works Department',
  'Other': 'General Administration'
};

const SEVERITY_SCORES = { critical: 4, high: 3, medium: 2, low: 1 };

const SAFETY_KEYWORDS = [
  'danger', 'dangerous', 'accident', 'injury', 'collapse', 'falling',
  'broken', 'exposed', 'wire', 'electric', 'flood', 'fire', 'gas',
  'leak', 'sewage', 'overflow', 'crack', 'sinkhole', 'pothole',
  'open manhole', 'sharp', 'hazard', 'risk', 'emergency', 'unsafe'
];

const TRAFFIC_KEYWORDS = [
  'main road', 'highway', 'junction', 'intersection', 'school zone',
  'hospital', 'market', 'bus stop', 'railway', 'bridge', 'flyover',
  'signal', 'crossing', 'busy', 'traffic', 'congestion', 'arterial'
];

const IMPACT_KEYWORDS = [
  'multiple', 'many', 'several', 'block', 'area', 'colony', 'street',
  'neighborhood', 'society', 'apartment', 'residents', 'public',
  'community', 'everyone', 'children', 'elderly', 'pedestrian'
];

export function classifyComplaint(title, description, category) {
  const text = `${title} ${description}`.toLowerCase();
  let detectedCategory = category;

  if (!category || category === 'Other') {
    if (text.match(/pothole|road\s*damage|crack|asphalt|tar|pavement/)) detectedCategory = 'Roads';
    else if (text.match(/street\s*light|lamp|bulb|dark\s*road|lighting/)) detectedCategory = 'Streetlights';
    else if (text.match(/garbage|trash|waste|dump|litter|bin|rubbish/)) detectedCategory = 'Garbage';
    else if (text.match(/water|pipe|tap|supply|bore|tank|leak/)) detectedCategory = 'Water';
    else if (text.match(/drain|sewage|clog|manhole|gutter|canal/)) detectedCategory = 'Drainage';
    else if (text.match(/traffic|signal|sign|parking|speed|road\s*block/)) detectedCategory = 'Traffic';
    else if (text.match(/park|garden|playground|tree|bench/)) detectedCategory = 'Parks';
    else if (text.match(/building|office|toilet|public\s*facility/)) detectedCategory = 'Public Buildings';
    else if (text.match(/safe|danger|threat|crime|accident/)) detectedCategory = 'Public Safety';
  }

  return {
    category: detectedCategory || 'Other',
    department: CATEGORY_DEPARTMENT_MAP[detectedCategory] || CATEGORY_DEPARTMENT_MAP['Other']
  };
}

export function calculatePriority(title, description, severity, category, nearbyCount = 0) {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  // Severity base score (0-40)
  score += (SEVERITY_SCORES[severity] || 2) * 10;

  // Safety risk (0-25)
  const safetyHits = SAFETY_KEYWORDS.filter(kw => text.includes(kw)).length;
  score += Math.min(safetyHits * 5, 25);

  // High traffic area (0-15)
  const trafficHits = TRAFFIC_KEYWORDS.filter(kw => text.includes(kw)).length;
  score += Math.min(trafficHits * 5, 15);

  // Public impact (0-10)
  const impactHits = IMPACT_KEYWORDS.filter(kw => text.includes(kw)).length;
  score += Math.min(impactHits * 3, 10);

  // Nearby similar complaints boost (0-10)
  score += Math.min(nearbyCount * 2, 10);

  // Category-specific boosts
  if (category === 'Public Safety') score += 10;
  if (category === 'Drainage' && text.includes('overflow')) score += 8;
  if (category === 'Water' && text.includes('contamina')) score += 10;

  // Normalize
  const normalizedScore = Math.min(score, 100);

  let priority, publicImpact;
  if (normalizedScore >= 70) { priority = 'P1'; publicImpact = 'Critical'; }
  else if (normalizedScore >= 50) { priority = 'P2'; publicImpact = 'High'; }
  else if (normalizedScore >= 30) { priority = 'P3'; publicImpact = 'Medium'; }
  else { priority = 'P4'; publicImpact = 'Low'; }

  return { priority, score: normalizedScore, publicImpact };
}

export function explainPriority(title, description, severity, category) {
  const text = `${title} ${description}`.toLowerCase();
  const reasons = [];

  const safetyHits = SAFETY_KEYWORDS.filter(kw => text.includes(kw));
  if (safetyHits.length > 0) reasons.push(`Safety concern detected: ${safetyHits.slice(0, 3).join(', ')}`);

  const trafficHits = TRAFFIC_KEYWORDS.filter(kw => text.includes(kw));
  if (trafficHits.length > 0) reasons.push(`Located near high-traffic area: ${trafficHits.slice(0, 2).join(', ')}`);

  const impactHits = IMPACT_KEYWORDS.filter(kw => text.includes(kw));
  if (impactHits.length > 0) reasons.push('Affects multiple residents or public spaces');

  if (severity === 'critical') reasons.push('Marked as critical severity by reporter');
  if (severity === 'high') reasons.push('Marked as high severity by reporter');

  if (category === 'Public Safety') reasons.push('Public safety issues receive elevated priority');
  if (category === 'Roads') reasons.push('Road issues impact daily commuters and vehicle safety');
  if (category === 'Drainage') reasons.push('Drainage issues can escalate during rainfall');
  if (category === 'Water') reasons.push('Water supply issues affect daily household needs');

  if (reasons.length === 0) reasons.push('Standard priority based on category and severity assessment');

  return reasons;
}

export function recommendSLA(priority) {
  const slaMap = {
    'P1': { hours: 24, label: '24 Hours' },
    'P2': { hours: 48, label: '48 Hours' },
    'P3': { hours: 72, label: '72 Hours (3 Days)' },
    'P4': { hours: 168, label: '7 Days' }
  };
  return slaMap[priority] || slaMap['P3'];
}

export function detectDuplicates(newComplaint, existingComplaints) {
  const duplicates = [];
  const MAX_DISTANCE_KM = 0.5; // 500 meters

  for (const existing of existingComplaints) {
    if (existing.status === 'resolved') continue;

    let similarityScore = 0;

    // Geographic distance
    const distance = haversineDistance(
      newComplaint.latitude, newComplaint.longitude,
      existing.latitude, existing.longitude
    );

    if (distance > MAX_DISTANCE_KM) continue;

    // Closer = higher score
    similarityScore += Math.max(0, (1 - distance / MAX_DISTANCE_KM)) * 40;

    // Category match
    if (newComplaint.category === existing.category) {
      similarityScore += 30;
    }

    // Description keyword similarity
    const newWords = new Set(`${newComplaint.title} ${newComplaint.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const existWords = new Set(`${existing.title} ${existing.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const intersection = [...newWords].filter(w => existWords.has(w));
    const union = new Set([...newWords, ...existWords]);
    const jaccardSimilarity = union.size > 0 ? intersection.length / union.size : 0;
    similarityScore += jaccardSimilarity * 30;

    if (similarityScore >= 40) {
      duplicates.push({
        complaintId: existing.complaintId,
        _id: existing._id,
        title: existing.title,
        status: existing.status,
        distance: Math.round(distance * 1000),
        similarity: Math.round(similarityScore),
        createdAt: existing.createdAt
      });
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

export function detectHotspots(complaints, gridSizeKm = 0.5) {
  const clusters = {};

  for (const c of complaints) {
    const gridLat = Math.round(c.latitude / (gridSizeKm / 111)) * (gridSizeKm / 111);
    const gridLng = Math.round(c.longitude / (gridSizeKm / 111)) * (gridSizeKm / 111);
    const key = `${gridLat.toFixed(4)},${gridLng.toFixed(4)}`;

    if (!clusters[key]) {
      clusters[key] = {
        latitude: gridLat,
        longitude: gridLng,
        complaints: [],
        categories: {},
        count: 0
      };
    }

    clusters[key].complaints.push(c);
    clusters[key].count++;
    clusters[key].categories[c.category] = (clusters[key].categories[c.category] || 0) + 1;
  }

  const hotspots = Object.values(clusters)
    .filter(cluster => cluster.count >= 3)
    .map(cluster => {
      const primaryCategory = Object.entries(cluster.categories)
        .sort((a, b) => b[1] - a[1])[0];

      const recentComplaints = cluster.complaints
        .filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      const olderComplaints = cluster.complaints
        .filter(c => {
          const created = new Date(c.createdAt);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
          return created >= sixtyDaysAgo && created < thirtyDaysAgo;
        });

      const trend = olderComplaints.length > 0
        ? Math.round(((recentComplaints.length - olderComplaints.length) / olderComplaints.length) * 100)
        : 0;

      return {
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        totalComplaints: cluster.count,
        recentComplaints: recentComplaints.length,
        primaryCategory: primaryCategory ? primaryCategory[0] : 'Mixed',
        categoryBreakdown: cluster.categories,
        trend,
        severity: cluster.count >= 10 ? 'critical' : cluster.count >= 5 ? 'high' : 'moderate',
        recommendedAction: getHotspotRecommendation(primaryCategory ? primaryCategory[0] : 'Mixed', cluster.count)
      };
    })
    .sort((a, b) => b.totalComplaints - a.totalComplaints);

  return hotspots;
}

function getHotspotRecommendation(category, count) {
  const recommendations = {
    'Roads': 'Schedule comprehensive road survey and resurfacing for this zone',
    'Streetlights': 'Deploy electrical maintenance team for area-wide lighting audit',
    'Garbage': 'Increase waste collection frequency and deploy additional bins',
    'Water': 'Inspect water supply pipeline infrastructure in this area',
    'Drainage': 'Conduct drainage system cleaning and structural inspection',
    'Traffic': 'Review traffic management and signal timing for this zone',
    'Public Safety': 'Increase patrol frequency and install surveillance infrastructure',
    'Parks': 'Schedule maintenance and landscaping for public spaces',
    'Public Buildings': 'Arrange facility inspection and maintenance schedule',
    'Mixed': 'Conduct comprehensive civic infrastructure audit for this area'
  };
  return recommendations[category] || recommendations['Mixed'];
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function analyzeComplaint(title, description, category, severity, latitude, longitude, nearbyComplaints = []) {
  const classification = classifyComplaint(title, description, category);
  const nearbyCount = nearbyComplaints.filter(c =>
    c.category === classification.category &&
    haversineDistance(latitude, longitude, c.latitude, c.longitude) < 1
  ).length;

  const priorityResult = calculatePriority(title, description, severity, classification.category, nearbyCount);
  const reasons = explainPriority(title, description, severity, classification.category);
  const sla = recommendSLA(priorityResult.priority);
  const duplicates = detectDuplicates(
    { title, description, category: classification.category, latitude, longitude },
    nearbyComplaints
  );

  const maxDupScore = duplicates.length > 0 ? duplicates[0].similarity : 0;

  return {
    issueDetected: classification.category,
    department: classification.department,
    severity: severity,
    estimatedPublicImpact: priorityResult.publicImpact,
    suggestedPriority: priorityResult.priority,
    aiScore: priorityResult.score,
    duplicateProbability: maxDupScore,
    recommendedSLA: sla.label,
    slaHours: sla.hours,
    reasons,
    duplicates
  };
}
