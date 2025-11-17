export type IndiaLocation = {
  state: string;
  cities: string[];
};

// This list contains all Indian States and Union Territories with a
// representative set of major cities per state/UT. It's intentionally
// limited to a handful of common cities per state to keep the bundle
// small — replace or extend with a fuller dataset if you need every
// municipal or district-level entry.
export const INDIA_LOCATIONS: IndiaLocation[] = [
  { state: 'Andhra Pradesh', cities: ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Nellore'] },
  { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'] },
  { state: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'] },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Bihar Sharif'] },
  { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Korba', 'Durg', 'Bilaspur'] },
  { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
  { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'] },
  { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi'] },
  { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangalore', 'Hubli', 'Belgaum'] },
  { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha'] },
  { state: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'] },
  { state: 'Manipur', cities: ['Imphal', 'Thoubal'] },
  { state: 'Meghalaya', cities: ['Shillong', 'Tura'] },
  { state: 'Mizoram', cities: ['Aizawl'] },
  { state: 'Nagaland', cities: ['Kohima', 'Dimapur'] },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'] },
  { state: 'Punjab', cities: ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Bathinda'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
  { state: 'Sikkim', cities: ['Gangtok'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { state: 'Tripura', cities: ['Agartala'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Prayagraj', 'Varanasi', 'Noida'] },
  { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Nainital', 'Roorkee'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Howrah'] },
  // Union Territories
  { state: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
  { state: 'Chandigarh', cities: ['Chandigarh'] },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman', 'Diu', 'Silvassa'] },
  { state: 'Lakshadweep', cities: ['Kavaratti'] },
  { state: 'Delhi', cities: ['New Delhi', 'Delhi'] },
  { state: 'Puducherry', cities: ['Puducherry', 'Karaikal'] },
];

export default INDIA_LOCATIONS;
