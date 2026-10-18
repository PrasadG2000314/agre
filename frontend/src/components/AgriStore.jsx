import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Tag, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  Scale, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Leaf,
  X
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'All',
  'Fresh Vegetables',
  'Organic Fruits',
  'Grains & Cereals',
  'Tubers & Root Crops',
  'Farm Herbs & Spices'
];

export default function AgriStore({ onNavigateToLogistics, onShipmentCreated }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [orderModalProduct, setOrderModalProduct] = useState(null);
  
  // Order Form State
  const [orderQty, setOrderQty] = useState(50);
  const [buyerName, setBuyerName] = useState('Metro Fresh Supermarket');
  const [buyerPhone, setBuyerPhone] = useState('+1 (555) 789-0123');
  const [destination, setDestination] = useState('Bay Street Fresh Terminal Dock 4');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  const loadProducts = async (cat) => {
    setLoading(true);
    try {
      const data = await api.getProducts(cat);
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = (prod) => {
    setOrderModalProduct(prod);
    setOrderQty(prod.stockKg > 100 ? 100 : 25);
    setOrderSuccessData(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderModalProduct) return;
    setOrderSubmitting(true);
    try {
      const res = await api.placeOrder({
        productId: orderModalProduct.id,
        productName: orderModalProduct.name,
        category: orderModalProduct.category,
        quantityKg: orderQty,
        pricePerKg: orderModalProduct.pricePerKg,
        buyerName,
        buyerPhone,
        destination
      });

      if (res.success) {
        setOrderSuccessData(res.shipment);
        if (onShipmentCreated) {
          onShipmentCreated(res.shipment);
        }
      }
    } catch (err) {
      alert('Error creating order: ' + err.message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="agri-store-page">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-bg-accent"></div>
        <div className="hero-content">
          <div className="hero-tag">
            <Sprout size={16} />
            <span>Farm-To-Fork Cold Chain Infrastructure</span>
          </div>
          <h1 className="hero-title">
            Fresh Agricultural Harvest Direct From Verified Farms
          </h1>
          <p className="hero-subtitle">
            Source high-grade farm produce with transparent 1 kg pricing. Real-time temperature-controlled logistics, automated driver dispatch, and instant proof of delivery.
          </p>

          <div className="hero-features-bar">
            <div className="hero-feat-item">
              <CheckCircle2 size={18} color="#34d399" />
              <span>Transparent 1 kg Standard Rates</span>
            </div>
            <div className="hero-feat-item">
              <Truck size={18} color="#34d399" />
              <span>Refrigerated Fleet Dispatch</span>
            </div>
            <div className="hero-feat-item">
              <ShieldCheck size={18} color="#34d399" />
              <span>100% Certified Organic Farms</span>
            </div>
            <div className="hero-feat-item">
              <Clock size={18} color="#34d399" />
              <span>Same-Day Harvest To Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Food Category Selector Bar */}
      <section className="category-section">
        <div className="category-pills-container">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <Leaf size={16} />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Produce Catalog Section */}
      <main className="store-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {selectedCategory === 'All' ? 'All Farm Fresh Produce' : selectedCategory}
            </h2>
            <p className="section-desc">
              All items priced per 1 kg standard unit. Packaged fresh in climate-controlled crates.
            </p>
          </div>
          <div style={{ color: '#065f46', fontWeight: '700', fontSize: '0.9rem' }}>
            Showing {products.length} agricultural items
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Loading fresh produce catalog...</div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(prod => (
              <div key={prod.id || prod._id} className="product-card">
                <div className="product-image-wrap">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="product-image"
                    loading="lazy"
                  />
                  <span className="product-category-tag">
                    {prod.category}
                  </span>
                  {prod.organic && (
                    <span className="product-organic-badge">
                      <Leaf size={13} />
                      <span>Organic</span>
                    </span>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-title">{prod.name}</h3>
                  <div className="product-origin">
                    <MapPin size={14} color="#059669" />
                    <span>{prod.origin}</span>
                  </div>
                  <p className="product-desc">{prod.description}</p>

                  {/* 1 KG Price Banner Requirement */}
                  <div className="product-price-box">
                    <div>
                      <div className="price-label">Standard Rate</div>
                      <div className="price-value-wrap">
                        <span className="price-amount">{prod.currency || '$'}{prod.pricePerKg.toFixed(2)}</span>
                        <span className="price-unit">/ {prod.unit || '1 kg'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '600' }}>Available Stock</div>
                      <div style={{ fontSize: '0.925rem', fontWeight: '700', color: '#0f172a' }}>
                        {prod.stockKg} kg
                      </div>
                    </div>
                  </div>

                  <button 
                    className="order-btn"
                    onClick={() => handleOpenOrder(prod)}
                    id={`btn-order-${prod.id}`}
                  >
                    <ShoppingBag size={18} />
                    <span>Order & Create Shipment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Quick Order & Shipment Generator Modal */}
      {orderModalProduct && (
        <div className="modal-backdrop" onClick={() => setOrderModalProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {orderSuccessData ? 'Shipment Placed Successfully!' : `Order & Dispatch: ${orderModalProduct.name}`}
              </h3>
              <button onClick={() => setOrderModalProduct(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {orderSuccessData ? (
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h4 style={{ fontSize: '1.3rem', color: '#064e3b', marginBottom: '0.5rem' }}>
                  Agricultural Order Registered
                </h4>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Your shipment has been created and queued in the <strong>User & Logistics Management System</strong>.
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Tracking Number:</span>
                    <strong style={{ color: '#065f46' }}>{orderSuccessData.trackingNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Cargo Quantity:</span>
                    <strong>{orderSuccessData.weightKg} kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Cost:</span>
                    <strong style={{ color: '#059669', fontSize: '1.1rem' }}>${orderSuccessData.totalPrice.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Delivery Security OTP:</span>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                      {orderSuccessData.otpCode}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => setOrderModalProduct(null)}
                  >
                    Continue Browsing
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setOrderModalProduct(null);
                      onNavigateToLogistics();
                    }}
                  >
                    <Truck size={17} />
                    <span>View in Logistics Portal</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder}>
                <div className="modal-body">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                    <img 
                      src={orderModalProduct.image} 
                      alt={orderModalProduct.name} 
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>{orderModalProduct.name}</div>
                      <div style={{ color: '#059669', fontWeight: '700', fontSize: '0.9rem' }}>
                        ${orderModalProduct.pricePerKg.toFixed(2)} per 1 kg
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Quantity to Order (in Kilograms):</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={orderModalProduct.stockKg}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>Max available: {orderModalProduct.stockKg} kg</span>
                      <strong style={{ color: '#064e3b' }}>
                        Total: ${(orderQty * orderModalProduct.pricePerKg).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Buyer / Recipient Name:</label>
                    <input 
                      type="text" 
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Recipient Phone Number (for Delivery OTP verification):</label>
                    <input 
                      type="text" 
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Destination / Warehouse Bay:</label>
                    <textarea 
                      rows="2"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setOrderModalProduct(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={orderSubmitting}
                  >
                    {orderSubmitting ? 'Creating Shipment...' : `Confirm Order ($${(orderQty * orderModalProduct.pricePerKg).toFixed(2)})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
