// All 64 districts of Bangladesh. `division` is kept only so the order API
// (which still stores a division) can be filled in automatically.
export interface BdDistrict {
  name: string;
  bn_name: string;
  division: string;
}

const d = (division: string, items: [string, string][]): BdDistrict[] =>
  items.map(([name, bn_name]) => ({ name, bn_name, division }));

export const bdDistricts: BdDistrict[] = [
  ...d('Dhaka', [
    ['Dhaka', 'ঢাকা'], ['Gazipur', 'গাজীপুর'], ['Narayanganj', 'নারায়ণগঞ্জ'], ['Narsingdi', 'নরসিংদী'],
    ['Manikganj', 'মানিকগঞ্জ'], ['Munshiganj', 'মুন্সীগঞ্জ'], ['Tangail', 'টাঙ্গাইল'], ['Kishoreganj', 'কিশোরগঞ্জ'],
    ['Faridpur', 'ফরিদপুর'], ['Gopalganj', 'গোপালগঞ্জ'], ['Madaripur', 'মাদারীপুর'], ['Rajbari', 'রাজবাড়ী'],
    ['Shariatpur', 'শরীয়তপুর'],
  ]),
  ...d('Chattogram', [
    ['Chattogram', 'চট্টগ্রাম'], ["Cox's Bazar", 'কক্সবাজার'], ['Cumilla', 'কুমিল্লা'], ['Feni', 'ফেনী'],
    ['Brahmanbaria', 'ব্রাহ্মণবাড়িয়া'], ['Noakhali', 'নোয়াখালী'], ['Lakshmipur', 'লক্ষ্মীপুর'], ['Chandpur', 'চাঁদপুর'],
    ['Khagrachhari', 'খাগড়াছড়ি'], ['Rangamati', 'রাঙ্গামাটি'], ['Bandarban', 'বান্দরবান'],
  ]),
  ...d('Rajshahi', [
    ['Rajshahi', 'রাজশাহী'], ['Bogura', 'বগুড়া'], ['Joypurhat', 'জয়পুরহাট'], ['Naogaon', 'নওগাঁ'],
    ['Natore', 'নাটোর'], ['Chapainawabganj', 'চাঁপাইনবাবগঞ্জ'], ['Pabna', 'পাবনা'], ['Sirajganj', 'সিরাজগঞ্জ'],
  ]),
  ...d('Khulna', [
    ['Khulna', 'খুলনা'], ['Bagerhat', 'বাগেরহাট'], ['Chuadanga', 'চুয়াডাঙ্গা'], ['Jashore', 'যশোর'],
    ['Jhenaidah', 'ঝিনাইদহ'], ['Kushtia', 'কুষ্টিয়া'], ['Magura', 'মাগুরা'], ['Meherpur', 'মেহেরপুর'],
    ['Narail', 'নড়াইল'], ['Satkhira', 'সাতক্ষীরা'],
  ]),
  ...d('Barishal', [
    ['Barishal', 'বরিশাল'], ['Barguna', 'বরগুনা'], ['Bhola', 'ভোলা'], ['Jhalokati', 'ঝালকাঠি'],
    ['Patuakhali', 'পটুয়াখালী'], ['Pirojpur', 'পিরোজপুর'],
  ]),
  ...d('Sylhet', [
    ['Sylhet', 'সিলেট'], ['Habiganj', 'হবিগঞ্জ'], ['Moulvibazar', 'মৌলভীবাজার'], ['Sunamganj', 'সুনামগঞ্জ'],
  ]),
  ...d('Rangpur', [
    ['Rangpur', 'রংপুর'], ['Dinajpur', 'দিনাজপুর'], ['Gaibandha', 'গাইবান্ধা'], ['Kurigram', 'কুড়িগ্রাম'],
    ['Lalmonirhat', 'লালমনিরহাট'], ['Nilphamari', 'নীলফামারী'], ['Panchagarh', 'পঞ্চগড়'], ['Thakurgaon', 'ঠাকুরগাঁও'],
  ]),
  ...d('Mymensingh', [
    ['Mymensingh', 'ময়মনসিংহ'], ['Jamalpur', 'জামালপুর'], ['Netrokona', 'নেত্রকোণা'], ['Sherpur', 'শেরপুর'],
  ]),
];
