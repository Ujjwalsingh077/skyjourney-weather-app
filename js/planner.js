const rules = [
  {
    match: /thunder|storm|rain|drizzle/i,
    status: "alert",
    title: "Weather could interrupt plans",
    advice: "Build in extra travel time and keep indoor backup options ready.",
    packing: ["Umbrella", "Waterproof shoes", "Quick-dry layer", "Sealed pouch for devices"]
  },
  {
    match: /snow|sleet|ice/i,
    status: "alert",
    title: "Cold-weather travel kit needed",
    advice: "Check road and flight updates before departure and dress in warm layers.",
    packing: ["Insulated jacket", "Gloves", "Warm socks", "Thermal base layer"]
  },
  {
    match: /clear|sun/i,
    status: "good",
    title: "Great day for outdoor plans",
    advice: "The forecast looks friendly for sightseeing, walking tours, and open-air dining.",
    packing: ["Sunscreen", "Sunglasses", "Water bottle", "Light hat"]
  },
  {
    match: /cloud|mist|fog|haze/i,
    status: "watch",
    title: "Comfortable with visibility checks",
    advice: "Conditions are manageable, but keep flexible timing for scenic views and transport.",
    packing: ["Light jacket", "Comfortable shoes", "Portable charger", "Reusable water bottle"]
  }
];

const SCORE_WEIGHTS = {
  temperature: 28,
  humidity: 16,
  wind: 15,
  rain: 18,
  aqi: 13,
  uv: 10
};

const SCORE_CATEGORIES = [
  { min: 90, label: "Excellent for Travel", tone: "excellent" },
  { min: 75, label: "Good", tone: "good" },
  { min: 60, label: "Moderate", tone: "moderate" },
  { min: 40, label: "Poor", tone: "poor" },
  { min: 0, label: "Avoid Travel", tone: "avoid" }
];

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const conditionHas = (item, pattern) => pattern.test(item?.description ?? "");

const scoreRange = (value, idealMin, idealMax, hardMin, hardMax) => {
  if (value >= idealMin && value <= idealMax) {
    return 100;
  }

  if (value < idealMin) {
    return clamp(((value - hardMin) / (idealMin - hardMin)) * 100);
  }

  return clamp(((hardMax - value) / (hardMax - idealMax)) * 100);
};

const rainChance = (item) => item?.rainProbability ?? (conditionHas(item, /rain|drizzle|thunder|storm/i) ? 0.8 : 0.08);
const aqiScore = (aqi) => clamp(120 - (aqi || 1) * 20);
const uvScore = (uvIndex) => scoreRange(uvIndex ?? 5, 2, 6, 0, 11);
const scoreStars = (score) => Math.max(1, Math.round(score / 20));

const getTargetForecast = (date, current, forecast) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime()) || forecast.length === 0) {
    return forecast[0] ?? current;
  }

  return forecast.reduce((best, item) => {
    const delta = Math.abs(new Date(item.time) - target);
    const bestDelta = Math.abs(new Date(best.time) - target);
    return delta < bestDelta ? item : best;
  }, forecast[0] ?? current);
};

const getForecastForDate = (date, forecast) => {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return forecast.slice(0, 8);
  }

  const selected = forecast.filter((item) => new Date(item.time).toDateString() === target.toDateString());
  return selected.length ? selected : forecast.slice(0, 8);
};

const explainScore = (item, air) => {
  const reasons = [];
  const rain = rainChance(item);

  if (item.temp >= 18 && item.temp <= 30) reasons.push("Pleasant temperature");
  if (item.humidity >= 30 && item.humidity <= 70) reasons.push("Comfortable humidity");
  if (rain < 0.25 && !conditionHas(item, /rain|drizzle|thunder|storm/i)) reasons.push("Low rain chance");
  if ((air?.aqi ?? 1) <= 2) reasons.push("Good air quality");
  if ((air?.uvIndex ?? 5) <= 6) reasons.push("Manageable UV index");
  if (item.wind <= 18) reasons.push("Light wind");

  return reasons.slice(0, 5);
};

/**
 * Calculates a weighted 0-100 travel score from weather and air data.
 * @param {object} item
 * @param {object} air
 * @returns {{score: number, category: object, stars: number, reasons: string[]}}
 */
export function calculateTravelScore(item, air) {
  const rain = rainChance(item);
  const score =
    scoreRange(item.temp, 18, 30, -5, 42) * (SCORE_WEIGHTS.temperature / 100) +
    scoreRange(item.humidity, 30, 70, 10, 95) * (SCORE_WEIGHTS.humidity / 100) +
    clamp(100 - item.wind * 3.2) * (SCORE_WEIGHTS.wind / 100) +
    clamp(100 - rain * 100) * (SCORE_WEIGHTS.rain / 100) +
    aqiScore(air?.aqi) * (SCORE_WEIGHTS.aqi / 100) +
    uvScore(air?.uvIndex) * (SCORE_WEIGHTS.uv / 100);
  const rounded = Math.round(clamp(score));

  return {
    score: rounded,
    category: SCORE_CATEGORIES.find((category) => rounded >= category.min),
    stars: scoreStars(rounded),
    reasons: explainScore(item, air)
  };
}

/**
 * Finds the best departure window for the selected travel date.
 * @param {string} date
 * @param {object[]} forecast
 * @returns {{ideal: boolean, label: string, time: string, reasons: string[]}}
 */
export function getBestDepartureWindow(date, forecast) {
  const options = getForecastForDate(date, forecast);
  const ranked = options.map((item) => {
    const rain = rainChance(item);
    const conditionPenalty = conditionHas(item, /thunder|storm|heavy rain|snow/i) ? 35 : 0;
    const comfort =
      scoreRange(item.temp, 18, 30, 0, 42) * 0.4 +
      clamp(100 - rain * 100) * 0.3 +
      clamp(100 - item.wind * 3.5) * 0.2 +
      (conditionHas(item, /clear|sun|partly|cloud/i) ? 10 : 0) -
      conditionPenalty;
    return { item, score: clamp(comfort) };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 45) {
    return {
      ideal: false,
      label: "No Ideal Travel Window",
      time: "",
      reasons: ["Poor weather is expected for most available travel windows.", "Consider postponing your trip."]
    };
  }

  const item = best.item;
  const reasons = [];
  if (rainChance(item) < 0.25) reasons.push("Lowest rain chance");
  if (item.temp >= 18 && item.temp <= 30) reasons.push("Pleasant temperature");
  if (item.wind <= 18) reasons.push("Light wind");
  if (!conditionHas(item, /thunder|storm|snow|heavy rain/i)) reasons.push("Comfortable travel conditions");

  return {
    ideal: true,
    label: new Date(item.time).toLocaleDateString(undefined, { weekday: "long" }),
    time: new Date(item.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    reasons: reasons.slice(0, 4)
  };
}

/**
 * Calculates current travel risk from weather hazards.
 * @param {object} current
 * @param {object} air
 * @returns {{level: string, tone: string, value: number, title: string, reasons: string[], recommendations: string[]}}
 */
export function calculateTravelRisk(current, air) {
  const reasons = [];
  let risk = 0;

  if (conditionHas(current, /thunder|storm/i)) {
    risk += 38;
    reasons.push("Thunderstorm risk");
  } else if (conditionHas(current, /heavy rain|rain|drizzle/i)) {
    risk += 24;
    reasons.push("Rain expected");
  }

  if (conditionHas(current, /snow|sleet|ice/i)) {
    risk += 34;
    reasons.push("Snow or icy conditions");
  }

  if (current.wind >= 35) {
    risk += 28;
    reasons.push("Strong wind");
  } else if (current.wind >= 22) {
    risk += 16;
    reasons.push("Moderate wind");
  }

  if ((current.visibility ?? 10) < 3) {
    risk += 28;
    reasons.push("Poor visibility");
  } else if ((current.visibility ?? 10) < 6) {
    risk += 14;
    reasons.push("Reduced visibility");
  }

  if ((air?.aqi ?? 1) >= 4) {
    risk += 24;
    reasons.push("Poor air quality");
  }

  if ((air?.uvIndex ?? 5) >= 8) {
    risk += 14;
    reasons.push("High UV index");
  }

  const value = clamp(risk);
  if (value >= 65) {
    return {
      level: "High",
      tone: "high",
      value,
      title: "Travel Not Recommended",
      reasons: reasons.slice(0, 4),
      recommendations: ["Delay travel until weather improves.", "Check official travel and road advisories."]
    };
  }

  if (value >= 32) {
    return {
      level: "Medium",
      tone: "medium",
      value,
      title: "Travel with Caution",
      reasons: reasons.slice(0, 4),
      recommendations: ["Carry weather protection.", "Drive carefully and allow extra time."]
    };
  }

  return {
    level: "Low",
    tone: "low",
    value,
    title: "Safe to Travel",
    reasons: reasons.length ? reasons : ["Clear conditions", "Good visibility", "Manageable wind"],
    recommendations: ["Current conditions are suitable for travel."]
  };
}
function clothingAdvice(temp){

if(temp>=35){
return [
"Light Cotton T-Shirt",
"Shorts",
"Cap",
"Sunglasses"
];
}

if(temp>=20){
return [
"T-Shirt",
"Jeans",
"Sneakers"
];
}

if(temp>=10){
return [
"Light Jacket",
"Full Pants",
"Shoes"
];
}

return[
"Winter Jacket",
"Gloves",
"Boots",
"Wool Cap"
];

}
function healthAdvice(air,temp){

const tips=[];

if(air?.aqi>=4)
tips.push("Wear a mask outdoors.");

if(temp>=35)
tips.push("Drink plenty of water.");

if(temp<=5)
tips.push("Wear thermal clothing.");

tips.push("Carry sunscreen.");

return tips;

}
function generateSummary(destination,current,risk){

return `

Weather in ${destination} is currently
${current.description}
with a temperature of
${Math.round(current.temp)}°C.

Travel Risk is ${risk.level}.

${
risk.level==="Low"
?"Outdoor activities are recommended."
:"Travel carefully and keep checking weather updates."
}

`;

}
/**
 * Generates travel recommendations from forecast, current conditions, and air metrics.
 * @param {{destination: string, date: string, current: object, forecast: object[], air: object}} input
 * @returns {object}
 */
export function planTrip({ destination, date, current, forecast, air }) {
  const closest = getTargetForecast(date, current, forecast);
  const condition = closest.description || current.description;
  const temp = closest.temp ?? current.temp;
  const rule = rules.find((item) => item.match.test(condition)) ?? rules[3];
  const warning = temp >= 35
    ? "High heat expected. Hydration and shade breaks are essential."
    : temp <= 5
      ? "Low temperatures expected. Prioritize warm layers."
      : "No severe temperature warning for the selected date.";
      const risk = calculateTravelRisk(current, air);

const clothes = clothingAdvice(temp);

const health = healthAdvice(air, temp);

const summary = generateSummary(destination, current, risk);

  return {
    ...rule,
    advice: `${rule.advice} Expected around ${destination}: ${condition}, ${Math.round(temp)}°C.`,
    warning,
    score: calculateTravelScore({ ...current, ...closest }, air),
    bestTime: getBestDepartureWindow(date, forecast),
    risk,
  clothes,
  health,
  summary
  };
}
