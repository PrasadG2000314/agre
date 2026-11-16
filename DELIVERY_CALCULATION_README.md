# 🚚 Dynamic Delivery Fee & Pricing System (Distance & Weight Based)
## දුර සහ බර අනුව Delivery ගාස්තුව ගණනය කිරීමේ පද්ධතිය

මෙම ලියවිල්ල මගින් AgriLogistics පද්ධතිය තුළ භාණ්ඩ ප්‍රවාහන දුර (Distance in km) සහ භාණ්ඩයේ බර (Weight in kg) මත පදනම්ව Delivery Fee එක සහ සම්පූර්ණ මුදල (Total Price) ස්වයංක්‍රීයව ගණනය වන ආකාරය සහ තාක්ෂණික ක්‍රියාකාරීත්වය පැහැදිලි කරයි.

---

## 1. ගණනය කිරීමේ සූත්‍රය (Mathematical Pricing Formula)

$$\text{Delivery Fee} = \text{Base Handling Fee} + (\text{Distance (km)} \times \text{Rate per km}) + (\text{Weight (kg)} \times \text{Rate per kg})$$

$$\text{Total Price} = \text{Produce Cost} + \text{Delivery Fee}$$

$$\text{Produce Cost} = \text{Weight (kg)} \times \text{Price per 1 kg}$$

### ⚙️ ගාස්තු විස්තර (Standard Rates):
| පරාමිතිය (Parameter) | අගය (Rate) | විස්තරය (Description) |
|---|---|---|
| **Base Fee** | **$5.00** | සෑම shipment එකකටම අදාළ වන මූලික පිටත්කිරීමේ සහ පරිපාලන ගාස්තුව |
| **Distance Rate** | **$0.50 / km** | ගොවිපළ/ගබඩාවේ සිට ගමනාන්තය දක්වා ගමන් කරන සෑම කිලෝමීටරයක් සඳහාම |
| **Weight Surcharge** | **$0.05 / kg** | වාහනයේ ඉන්ධන සහ බර පැටවීමේ ධාරිතාව අනුව සෑම කිලෝ 1ක් සඳහාම |

---

## 2. ප්‍රායෝගික උදාහරණයක් (Worked Calculation Example)

* **භාණ්ඩය (Product):** Crisp Vine-Ripened Tomatoes
* **1 kg මිල (Price per kg):** $2.80
* **ඇණවුම් කළ බර (Weight):** 50 kg
* **ප්‍රවාහන දුර (Distance):** 20 km

### ගණනය කිරීම:
1. **Produce Cost (භාණ්ඩයේ උපසමස්ථය):**  
   $$50 \text{ kg} \times \$2.80 = \mathbf{\$140.00}$$

2. **Delivery Fee (ප්‍රවාහන ගාස්තුව):**  
   * Base Fee = **$5.00**
   * Distance Fee = $20 \text{ km} \times \$0.50 = \mathbf{\$10.00}$
   * Weight Fee = $50 \text{ kg} \times \$0.05 = \mathbf{\$2.50}$
   * **මුළු Delivery Fee එක** = $\$5.00 + \$10.00 + \$2.50 = \mathbf{\$17.50}$

3. **Total Price (පාරිභෝගිකයා ගෙවිය යුතු මුළු මුදල):**  
   $$\$140.00 + \$17.50 = \mathbf{\$157.50}$$

---

## 3. Database Model යාවත්කාලීන කිරීම් (Data Schema)

`Shipment` Model එකට පහත නව fields ඇතුළත් කර ඇත (`backend/models/Shipment.js`):

```javascript
const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  weightKg: { type: Number, required: true },        // භාණ්ඩයේ බර (kg)
  pricePerKg: { type: Number, required: true },      // 1kg සඳහා මිල
  productCost: { type: Number, default: 0 },         // භාණ්ඩයේ මුළු වටිනාකම (weightKg * pricePerKg)
  distanceKm: { type: Number, default: 15 },         // ප්‍රවාහන දුර (km)
  deliveryFee: { type: Number, default: 0 },         // දුර සහ බර අනුව delivery fee එක
  totalPrice: { type: Number, required: true },      // සම්පූර්ණ මුදල (productCost + deliveryFee)
  // ... අනෙකුත් fields
});
```

---

## 4. Backend API Endpoints

### 1) Delivery Fee Quote එකක් ලබාගැනීම (Calculate Quote)
ඇණවුමක් කිරීමට පෙර දුර සහ බර අනුව delivery ගාස්තුව පරීක්ෂා කර ගැනීමට භාවිතා කළ හැක:

* **Endpoint:** `POST /api/shipments/calculate-quote`
* **Request Body:**
  ```json
  {
    "distanceKm": 30,
    "weightKg": 100,
    "pricePerKg": 2.50
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "breakdown": {
      "distanceKm": 30,
      "weightKg": 100,
      "baseFee": 5.00,
      "ratePerKm": 0.50,
      "ratePerKg": 0.05,
      "distanceFee": 15.00,
      "weightFee": 5.00,
      "deliveryFee": 25.00,
      "productCost": 250.00,
      "totalPrice": 275.00
    }
  }
  ```

---

### 2) Store එකෙන් Order එකක් සහ Shipment එකක් Create කිරීම
* **Endpoint:** `POST /api/products/order`
* **Request Body:**
  ```json
  {
    "productName": "Fresh Carrots",
    "category": "Fresh Vegetables",
    "quantityKg": 50,
    "pricePerKg": 2.00,
    "distanceKm": 20,
    "buyerName": "Nimal Perera",
    "buyerPhone": "+94771234567",
    "destination": "Colombo Central Market"
  }
  ```
* **Response (201 Created):**
  - Return වන `shipment` object එකෙහි `productCost`, `distanceKm`, `deliveryFee` සහ `totalPrice` ස්වයංක්‍රීයව ගණනය වී සටහන් වේ.

---

### 3) CSV Audit Export එක ලබාගැනීම
* **Endpoint:** `GET /api/reports/export-csv`
* **Response:** CSV ගොනුවක් බාගත වන අතර එහි `Distance (km)`, `Product Cost ($)`, සහ `Delivery Fee ($)` තීරු (columns) ඇතුළත් කර ඇත.

---

## 5. Frontend UI අතුරුමුහුණත් වල ක්‍රියාකාරීත්වය

1. **AgriStore (`frontend/src/components/AgriStore.jsx`):**
   * **Distance Slider & Input:** පාරිභෝගිකයාට කිලෝමීටර 1 සිට 500 දක්වා දුර සකස් කළ හැක.
   * **Real-time Price Breakdown Box:**
     - Produce Cost ($)
     - Delivery Fee ($) [Base $5 + Distance + Weight breakdown]
     - Total Payable Amount ($)
   * **Order Success Screen:** සාර්ථක වූ ඇණවුමේ දුර, cargo cost සහ delivery fee එක පැහැදිලිව පෙන්වයි.

2. **Shipment Management Tab (`frontend/src/components/logistics/ShipmentManagementTab.jsx`):**
   * **Manual Shipment Creation:** අලුත් shipment එකක් හදන විට Distance (km) ඇතුළත් කළ හැක.
   * **Shipment Table:** සෑම තීරුවකම `${weightKg} kg • ${distanceKm} km`, භාණ්ඩයේ මිල සහ Delivery fee එක වෙන්කර පෙන්වයි.

3. **Live Tracking Modal (`frontend/src/components/logistics/LiveTrackingModal.jsx`):**
   * Delivery & Pricing card එකක් හරහා shipment එකක සම්පූර්ණ ගාස්තුව සහ delivery fee එක ප්‍රදර්ශනය කරයි.

4. **Report Generator (`frontend/src/components/logistics/ReportGeneratorTab.jsx`):**
   * Completed deliveries සහ delayed shipments වල දුර සහ delivery fee audit කිරීමට හැකියාව ඇත.

---

## 6. පද්ධතිය ධාවනය කිරීම (How to Run)

```bash
# Backend ධාවනය කිරීමට (Port 5000)
cd backend
npm run dev

# Frontend ධාවනය කිරීමට (Port 5173)
cd frontend
npm run dev
```

* **Frontend UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 7. Logistics අවසර හා අනුමැතිය (Role-Based Access Control & Approvals)

පද්ධතිය තුළ ආරක්ෂාව සහ නීත්‍යානුකූල භාවය තහවුරු කිරීම සඳහා **Admin ට පමණක් අනුමත කිරීම් (Approvals & Mutations) සිදුකළ හැකි වන පරිදි සහ සාමාන්‍ය Users ලාට බැලීමට පමණක් (View-Only)** හැකි වන පරිදි සකසා ඇත:

| මෙහෙයුම (Operation) | සාමාන්‍ය පරිශීලක (User / Buyer / Seller) | පරිපාලක (Admin) |
|---|---|---|
| **Overview & KPIs බැලීම** | ✅ අවසර ඇත (View Only) | ✅ පූර්ණ අවසරය |
| **Shipments ලැයිස්තුව බැලීම** | ✅ අවසර ඇත (View Only) | ✅ පූර්ණ අවසරය |
| **සජීවී Tracking බැලීම** | ✅ අවසර ඇත (Live Tracking View) | ✅ පූර්ණ අවසරය |
| **Fleet & රියදුරන්ගේ ස්ථාන බැලීම** | ✅ අවසර ඇත (View Only) | ✅ පූර්ණ අවසරය |
| **වාර්තා (Reports & CSV) බැලීම** | ✅ අවසර ඇත (View Only) | ✅ පූර්ණ අවසරය |
| **Smart Auto-Dispatch අනුමත කිරීම** | ❌ **අවහිර කර ඇත (Admin Only)** | ✅ **අනුමත කළ හැක** |
| **රියදුරන් Assign කිරීම** | ❌ **අවහිර කර ඇත (Admin Only)** | ✅ **අනුමත කළ හැක** |
| **Shipment Status වෙනස් කිරීම** | ❌ **අවහිර කර ඇත (Admin Only)** | ✅ **අනුමත කළ හැක** |
| **Proof of Delivery (PoD) තහවුරු කිරීම** | ❌ **අවහිර කර ඇත (Admin Only)** | ✅ **අනුමත කළ හැක** |
| **Users / Drivers කළමනාකරණය** | ❌ **අවහිර කර ඇත (Admin Only)** | ✅ **අනුමත කළ හැක** |

> **Backend ආරක්ෂාව:** සාමාන්‍ය පරිශීලකයෙකු API එක හරහා ඍජුව වෙනස්කම් කිරීමට උත්සාහ කළද `requireAdmin` middleware එක මගින් `403 Forbidden ("Access Denied: Only Administrator accounts have permission to approve, assign, or modify logistics operations.")` ලබා දී අවහිර කරනු ලැබේ.

