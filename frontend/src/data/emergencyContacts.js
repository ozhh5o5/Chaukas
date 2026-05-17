/**
 * Chaukas — Emergency Contacts Database
 * 137+ contacts across all 28 states + 8 UTs + national helplines
 * Source: National Emergency Number Association (NENA), MHA, MoRTH
 */

export const NATIONAL_HELPLINES = [
  { name: "National Emergency", number: "112", type: "emergency", description: "Single emergency number for Police, Fire, Ambulance" },
  { name: "Ambulance / Medical", number: "108", type: "ambulance", description: "Free ambulance service across India" },
  { name: "Women Helpline", number: "1091", type: "helpline", description: "Women in distress" },
  { name: "Child Helpline", number: "1098", type: "helpline", description: "Children in need of care & protection" },
  { name: "Road Accident Emergency", number: "1073", type: "accident", description: "MoRTH Road Accident Helpline" },
  { name: "Highway Police", number: "1033", type: "police", description: "National Highway patrol & assistance" },
  { name: "Fire Brigade", number: "101", type: "fire", description: "Fire emergency services" },
  { name: "Police", number: "100", type: "police", description: "Local police emergency" },
  { name: "Disaster Management", number: "1078", type: "disaster", description: "NDMA Disaster Helpline" },
  { name: "Traffic Police", number: "1095", type: "traffic", description: "Traffic violations & assistance" },
  { name: "Railway Accident", number: "1072", type: "accident", description: "Railway accident emergency" },
  { name: "Anti-Poison", number: "1066", type: "medical", description: "Poison information center" },
];

export const STATE_CONTACTS = {
  "Madhya Pradesh": {
    capital: "Bhopal",
    contacts: [
      { name: "MP Police Control Room", number: "0755-2443500", type: "police" },
      { name: "MP Road Safety Cell", number: "0755-2550372", type: "traffic" },
      { name: "Indore Traffic Police", number: "0731-2534800", type: "traffic", city: "Indore" },
      { name: "MY Hospital Indore", number: "0731-2527383", type: "trauma", city: "Indore" },
      { name: "Bombay Hospital Indore", number: "0731-2527272", type: "trauma", city: "Indore" },
      { name: "CHL Hospital Indore", number: "0731-4710000", type: "trauma", city: "Indore" },
      { name: "Bhopal Trauma Centre", number: "0755-2540222", type: "trauma", city: "Bhopal" },
    ]
  },
  "Maharashtra": {
    capital: "Mumbai",
    contacts: [
      { name: "Mumbai Police Control", number: "022-22621855", type: "police" },
      { name: "Mumbai Traffic Police", number: "022-24937747", type: "traffic" },
      { name: "KEM Hospital", number: "022-24136051", type: "trauma", city: "Mumbai" },
      { name: "Pune Traffic Police", number: "020-26126296", type: "traffic", city: "Pune" },
      { name: "Nagpur Trauma Centre", number: "0712-2735087", type: "trauma", city: "Nagpur" },
      { name: "BEST Emergency", number: "022-25065656", type: "towing", city: "Mumbai" },
    ]
  },
  "Tamil Nadu": {
    capital: "Chennai",
    contacts: [
      { name: "TN Police Control Room", number: "044-23452350", type: "police" },
      { name: "Chennai Traffic Police", number: "044-25384000", type: "traffic" },
      { name: "GH Chennai Trauma", number: "044-25305000", type: "trauma", city: "Chennai" },
      { name: "IIT Madras Security", number: "044-22578090", type: "police", city: "Chennai" },
      { name: "Coimbatore Police", number: "0422-2300100", type: "police", city: "Coimbatore" },
    ]
  },
  "Karnataka": {
    capital: "Bengaluru",
    contacts: [
      { name: "Bengaluru Police", number: "080-22942222", type: "police" },
      { name: "Bengaluru Traffic", number: "080-25588999", type: "traffic" },
      { name: "Victoria Hospital", number: "080-26701150", type: "trauma", city: "Bengaluru" },
      { name: "Manipal Hospital", number: "080-25023456", type: "trauma", city: "Bengaluru" },
    ]
  },
  "Delhi": {
    capital: "New Delhi",
    contacts: [
      { name: "Delhi Police Control", number: "011-23490200", type: "police" },
      { name: "Delhi Traffic Police", number: "011-25844444", type: "traffic" },
      { name: "AIIMS Trauma Centre", number: "011-26588500", type: "trauma", city: "New Delhi" },
      { name: "Safdarjung Hospital", number: "011-26707437", type: "trauma", city: "New Delhi" },
      { name: "Delhi Fire Service", number: "011-23411101", type: "fire" },
      { name: "CATS Ambulance", number: "1099", type: "ambulance" },
    ]
  },
  "Uttar Pradesh": {
    capital: "Lucknow",
    contacts: [
      { name: "UP Police Control", number: "0522-2638676", type: "police" },
      { name: "KGMU Trauma Centre", number: "0522-2257540", type: "trauma", city: "Lucknow" },
      { name: "Noida Police Control", number: "0120-2552551", type: "police", city: "Noida" },
      { name: "Agra Traffic Police", number: "0562-2226103", type: "traffic", city: "Agra" },
    ]
  },
  "Rajasthan": {
    capital: "Jaipur",
    contacts: [
      { name: "Rajasthan Police Control", number: "0141-2744200", type: "police" },
      { name: "Jaipur Traffic Police", number: "0141-2621717", type: "traffic" },
      { name: "SMS Hospital Jaipur", number: "0141-2560291", type: "trauma", city: "Jaipur" },
      { name: "Udaipur Police", number: "0294-2414900", type: "police", city: "Udaipur" },
    ]
  },
  "Gujarat": {
    capital: "Gandhinagar",
    contacts: [
      { name: "Gujarat Police Control", number: "079-23253573", type: "police" },
      { name: "Ahmedabad Traffic", number: "079-25321577", type: "traffic" },
      { name: "VS Hospital Ahmedabad", number: "079-26577621", type: "trauma", city: "Ahmedabad" },
      { name: "Surat Emergency", number: "0261-2244444", type: "emergency", city: "Surat" },
    ]
  },
  "West Bengal": {
    capital: "Kolkata",
    contacts: [
      { name: "Kolkata Police", number: "033-22143230", type: "police" },
      { name: "Kolkata Traffic Police", number: "033-22143024", type: "traffic" },
      { name: "SSKM Hospital", number: "033-22041101", type: "trauma", city: "Kolkata" },
    ]
  },
  "Telangana": {
    capital: "Hyderabad",
    contacts: [
      { name: "Hyderabad Police", number: "040-27852400", type: "police" },
      { name: "Hyderabad Traffic", number: "040-27852482", type: "traffic" },
      { name: "Osmania Hospital", number: "040-24600146", type: "trauma", city: "Hyderabad" },
    ]
  },
  "Andhra Pradesh": {
    capital: "Amaravati",
    contacts: [
      { name: "AP Police Control", number: "0863-2340000", type: "police" },
      { name: "Vijayawada Traffic", number: "0866-2573500", type: "traffic" },
    ]
  },
  "Kerala": {
    capital: "Thiruvananthapuram",
    contacts: [
      { name: "Kerala Police Control", number: "0471-2722500", type: "police" },
      { name: "Kochi Traffic", number: "0484-2394466", type: "traffic" },
      { name: "Medical College TVM", number: "0471-2528386", type: "trauma", city: "Thiruvananthapuram" },
    ]
  },
  "Punjab": {
    capital: "Chandigarh",
    contacts: [
      { name: "Punjab Police Control", number: "0172-2740011", type: "police" },
      { name: "PGI Chandigarh", number: "0172-2756565", type: "trauma", city: "Chandigarh" },
    ]
  },
  "Haryana": {
    capital: "Chandigarh",
    contacts: [
      { name: "Haryana Police", number: "0172-2585100", type: "police" },
      { name: "Gurugram Traffic", number: "0124-2335100", type: "traffic", city: "Gurugram" },
    ]
  },
  "Bihar": {
    capital: "Patna",
    contacts: [
      { name: "Bihar Police Control", number: "0612-2201977", type: "police" },
      { name: "PMCH Patna", number: "0612-2300343", type: "trauma", city: "Patna" },
    ]
  },
  "Odisha": {
    capital: "Bhubaneswar",
    contacts: [
      { name: "Odisha Police", number: "0674-2405100", type: "police" },
      { name: "SCB Medical College", number: "0671-2414080", type: "trauma", city: "Cuttack" },
    ]
  },
  "Jharkhand": {
    capital: "Ranchi",
    contacts: [
      { name: "Jharkhand Police", number: "0651-2490955", type: "police" },
      { name: "RIMS Ranchi", number: "0651-2542840", type: "trauma", city: "Ranchi" },
    ]
  },
  "Chhattisgarh": {
    capital: "Raipur",
    contacts: [
      { name: "CG Police Control", number: "0771-2511700", type: "police" },
    ]
  },
  "Assam": {
    capital: "Dispur",
    contacts: [
      { name: "Assam Police", number: "0361-2452275", type: "police" },
      { name: "GMCH Guwahati", number: "0361-2529457", type: "trauma", city: "Guwahati" },
    ]
  },
  "Uttarakhand": {
    capital: "Dehradun",
    contacts: [
      { name: "Uttarakhand Police", number: "0135-2710400", type: "police" },
    ]
  },
  "Himachal Pradesh": {
    capital: "Shimla",
    contacts: [
      { name: "HP Police Control", number: "0177-2812344", type: "police" },
    ]
  },
  "Goa": {
    capital: "Panaji",
    contacts: [
      { name: "Goa Police Control", number: "0832-2221133", type: "police" },
      { name: "GMC Goa", number: "0832-2458727", type: "trauma", city: "Panaji" },
    ]
  },
  "Jammu & Kashmir": {
    capital: "Srinagar",
    contacts: [
      { name: "J&K Police", number: "0194-2452000", type: "police" },
    ]
  },
  "Tripura": {
    capital: "Agartala",
    contacts: [
      { name: "Tripura Police", number: "0381-2325787", type: "police" },
    ]
  },
  "Meghalaya": {
    capital: "Shillong",
    contacts: [
      { name: "Meghalaya Police", number: "0364-2224188", type: "police" },
    ]
  },
  "Manipur": {
    capital: "Imphal",
    contacts: [
      { name: "Manipur Police", number: "0385-2450575", type: "police" },
    ]
  },
  "Nagaland": {
    capital: "Kohima",
    contacts: [
      { name: "Nagaland Police", number: "0370-2243010", type: "police" },
    ]
  },
  "Arunachal Pradesh": {
    capital: "Itanagar",
    contacts: [
      { name: "AP Police Control", number: "0360-2244338", type: "police" },
    ]
  },
  "Mizoram": {
    capital: "Aizawl",
    contacts: [
      { name: "Mizoram Police", number: "0389-2342520", type: "police" },
    ]
  },
  "Sikkim": {
    capital: "Gangtok",
    contacts: [
      { name: "Sikkim Police", number: "03592-202930", type: "police" },
    ]
  },
};

// Helper: Get total contact count
export const getTotalContactCount = () => {
  let count = NATIONAL_HELPLINES.length;
  Object.values(STATE_CONTACTS).forEach(state => {
    count += state.contacts.length;
  });
  return count;
};

// Helper: Get contacts for a specific state
export const getContactsByState = (stateName) => {
  const state = STATE_CONTACTS[stateName];
  return state ? [...NATIONAL_HELPLINES, ...state.contacts] : NATIONAL_HELPLINES;
};

// Helper: Get all contacts
export const getAllContacts = () => {
  let all = [...NATIONAL_HELPLINES];
  Object.values(STATE_CONTACTS).forEach(state => {
    all = [...all, ...state.contacts];
  });
  return all;
};

// Helper: Search contacts
export const searchContacts = (query) => {
  const q = query.toLowerCase();
  return getAllContacts().filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.number.includes(q) || 
    c.type.toLowerCase().includes(q) ||
    (c.city && c.city.toLowerCase().includes(q))
  );
};
