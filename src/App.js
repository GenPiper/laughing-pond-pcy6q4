import React, { useState, useEffect } from 'react';
import { Calendar, Users, Bed, X, Plus, Check, AlertCircle, DollarSign, Loader2, History, LogOut, User } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFXIgqJnYfjWYm8Hjc59F2Bo7JQx7qjC4",
  authDomain: "olive-heights-booking-manager.firebaseapp.com",
  projectId: "olive-heights-booking-manager",
  storageBucket: "olive-heights-booking-manager.firebasestorage.app",
  messagingSenderId: "84474891607",
  appId: "1:84474891607:web:454946b3d3c6c6dfb20212",
  measurementId: "G-W8BE3CHZS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inline styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '24px',
    marginBottom: '24px'
  },
  loginCard: {
    maxWidth: '400px',
    margin: '100px auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '32px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '4px',
    fontSize: '14px'
  },
  button: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '24px'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#4f46e5',
    borderBottomColor: '#4f46e5'
  },
  revenueCard: {
    backgroundColor: '#f0fdf4',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: '8px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  statusCompleted: {
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
    display: 'block'
  }
};

const RoomBookingApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginName, setLoginName] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history
  const [formData, setFormData] = useState({
    roomNumber: '101',
    guestName: '',
    checkIn: '',
    checkOut: '',
    guests: '1'
  });
  const [error, setError] = useState('');

  const roomConfig = {
    101: { price: 200 },
    102: { price: 180 },
    103: { price: 180 },
    104: { price: 150 },
    105: { price: 150 },
    206: { price: 150 },
    207: { price: 200 },
    208: { price: 200 },
    209: { price: 150 },
    210: { price: 180 }
  };

  const rooms = [101, 102, 103, 104, 105, 206, 207, 208, 209, 210];

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('bookingUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = [];
      snapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading bookings:", error);
      setError("Failed to load bookings. Please refresh the page.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginName.trim()) {
      localStorage.setItem('bookingUser', loginName.trim());
      setCurrentUser(loginName.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bookingUser');
    setCurrentUser(null);
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculatePrice = (roomNumber, checkIn, checkOut) => {
    const nights = calculateNights(checkIn, checkOut);
    const pricePerNight = roomConfig[roomNumber].price;
    return nights * pricePerNight;
  };

  const checkBookingConflict = (roomNumber, checkIn, checkOut, excludeBookingId = null) => {
    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    return bookings.some(booking => {
      if (booking.id === excludeBookingId) return false;
      if (booking.roomNumber !== parseInt(roomNumber)) return false;
      if (booking.status !== 'active') return false; // Only check active bookings

      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);

      return (
        (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut) ||
        (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
        (newCheckIn <= existingCheckIn && newCheckOut >= existingCheckOut)
      );
    });
  };

  const createBooking = async () => {
    setError('');

    if (!formData.guestName || !formData.checkIn || !formData.checkOut) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (checkBookingConflict(formData.roomNumber, formData.checkIn, formData.checkOut)) {
      setError(`Room ${formData.roomNumber} is already booked for these dates. Please choose different dates or another room.`);
      return;
    }

    const totalPrice = calculatePrice(parseInt(formData.roomNumber), formData.checkIn, formData.checkOut);
    const nights = calculateNights(formData.checkIn, formData.checkOut);

    const newBooking = {
      roomNumber: parseInt(formData.roomNumber),
      guestName: formData.guestName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: parseInt(formData.guests),
      totalPrice,
      nights,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      history: [{
        action: 'created',
        by: currentUser,
        at: new Date().toISOString()
      }]
    };

    setSaving(true);
    try {
      await addDoc(collection(db, 'bookings'), newBooking);
      setFormData({
        roomNumber: '101',
        guestName: '',
        checkIn: '',
        checkOut: '',
        guests: '1'
      });
      setShowBookingForm(false);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    const action = newStatus === 'completed' ? 'Check-out' : 'Cancel';
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this booking?`)) return;
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const booking = bookings.find(b => b.id === bookingId);
      
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser,
        history: [
          ...(booking.history || []),
          {
            action: newStatus,
            by: currentUser,
            at: new Date().toISOString()
          }
        ]
      });
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking. Please try again.");
    }
  };

  const isRoomBooked = (roomNum, date) => {
    if (!date) return false;
    const checkDate = new Date(date);
    return bookings.some(booking => {
      if (booking.status !== 'active') return false;
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return booking.roomNumber === roomNum && 
             checkDate >= checkIn && 
             checkDate < checkOut;
    });
  };

  const getRoomBookings = (roomNum) => {
    return bookings.filter(b => b.roomNumber === roomNum && b.status === 'active');
  };

  const getFilteredBookings = () => {
    if (activeTab === 'active') {
      return bookings.filter(b => b.status === 'active');
    }
    return bookings.filter(b => b.status !== 'active');
  };

  const today = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(b => b.status === 'active');
  const totalRevenue = activeBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Login Screen
  if (!currentUser) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <h2 style={{ ...styles.title, justifyContent: 'center', marginBottom: '8px' }}>
            <Bed color="#4f46e5" />
            Olive Heights
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>
            Booking Manager
          </p>
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Enter Your Name</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                style={styles.input}
                placeholder="Your name"
                required
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.button, width: '100%', justifyContent: 'center' }}
            >
              <User size={20} />
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#4f46e5' }} />
          <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                <Bed color="#4f46e5" />
                Olive Heights Booking Manager
              </h1>
              <p style={styles.subtitle}>10 Bedroom Apartment • Real-time Sync</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={styles.userInfo}>
                <User size={16} color="#6b7280" />
                <span style={{ fontSize: '14px', color: '#374151' }}>{currentUser}</span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                  title="Logout"
                >
                  <LogOut size={16} color="#6b7280" />
                </button>
              </div>
              <div style={styles.revenueCard}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Active Revenue</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', margin: 0 }}>₵{totalRevenue}</p>
              </div>
              {activeTab === 'active' && (
                <button
                  onClick={() => {
                    setShowBookingForm(!showBookingForm);
                    setError('');
                  }}
                  style={styles.button}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
                >
                  {showBookingForm ? <X size={20} /> : <Plus size={20} />}
                  {showBookingForm ? 'Cancel' : 'New Booking'}
                </button>
              )}
            </div>
          </div>

          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'active' ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab('active')}
            >
              Active Bookings ({activeBookings.length})
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'history' ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} style={{ display: 'inline', marginRight: '4px' }} />
              History ({bookings.length - activeBookings.length})
            </button>
          </div>

          {activeTab === 'active' && showBookingForm && (
            <div style={{ backgroundColor: '#eef2ff', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>Create New Booking</h2>
              
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={styles.label}>Room Number</label>
                  <select
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    style={styles.input}
                    disabled={saving}
                  >
                    {rooms.map(room => (
                      <option key={room} value={room}>
                        Room {room} (₵{roomConfig[room].price}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={styles.label}>Guest Name</label>
                  <input
                    type="text"
                    value={formData.guestName}
                    onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                    style={styles.input}
                    placeholder="Enter guest name"
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={styles.label}>Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                    style={styles.input}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={styles.label}>Check-in Date</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    min={today}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    style={styles.input}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={styles.label}>Check-out Date</label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    min={formData.checkIn || today}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    style={styles.input}
                    disabled={saving}
                  />
                </div>

                {formData.checkIn && formData.checkOut && new Date(formData.checkOut) > new Date(formData.checkIn) && (
                  <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #c7d2fe', backgroundColor: 'white' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Estimated Total</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4f46e5', margin: '0 0 4px 0' }}>
                      ₵{calculatePrice(parseInt(formData.roomNumber), formData.checkIn, formData.checkOut)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      {calculateNights(formData.checkIn, formData.checkOut)} night(s) × ₵{roomConfig[parseInt(formData.roomNumber)].price}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={createBooking}
                disabled={saving}
                style={{
                  ...styles.button,
                  marginTop: '16px',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? <Loader2 size={20} /> : <Check size={20} />}
                {saving ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          )}

          {activeTab === 'active' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #fcd34d', backgroundColor: '#fefce8' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Premium Rooms</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706', margin: '0 0 4px 0' }}>₵200/night</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>101, 207, 208</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #c084fc', backgroundColor: '#faf5ff' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Standard Rooms</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#9333ea', margin: '0 0 4px 0' }}>₵180/night</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>102, 103, 210</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #60a5fa', backgroundColor: '#eff6ff' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Budget Rooms</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 4px 0' }}>₵150/night</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>104, 105, 206, 209</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {rooms.map(room => {
                  const roomBookings = getRoomBookings(room);
                  const isCurrentlyBooked = isRoomBooked(room, today);
                  const config = roomConfig[room];
                  
                  return (
                    <div
                      key={room}
                      style={{
                        border: '2px solid',
                        borderRadius: '8px',
                        padding: '16px',
                        borderColor: isCurrentlyBooked ? '#fca5a5' : '#86efac',
                        backgroundColor: isCurrentlyBooked ? '#fef2f2' : '#f0fdf4'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Room {room}</h3>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: isCurrentlyBooked ? '#fca5a5' : '#86efac',
                          color: isCurrentlyBooked ? '#991b1b' : '#166534'
                        }}>
                          {isCurrentlyBooked ? 'Occupied' : 'Available'}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={12} />
                        ₵{config.price}/night
                      </div>

                      {roomBookings.length > 0 ? (
                        <div>
                          {roomBookings.map(booking => (
                            <div key={booking.id} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                <p style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px', margin: 0 }}>
                                  {booking.guestName}
                                </p>
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                                  <Calendar size={12} />
                                  {booking.checkIn} to {booking.checkOut}
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                                  <Users size={12} />
                                  {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                                </p>
                                <p style={{ fontWeight: '600', color: '#4f46e5', margin: '4px 0' }}>
                                  ₵{booking.totalPrice} ({booking.nights} night{booking.nights > 1 ? 's' : ''})
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                    style={{
                                      ...styles.button,
                                      backgroundColor: '#10b981',
                                      fontSize: '12px',
                                      padding: '4px 8px'
                                    }}
                                  >
                                    <Check size={14} />
                                    Check-out
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                    style={{
                                      ...styles.button,
                                      backgroundColor: '#ef4444',
                                      fontSize: '12px',
                                      padding: '4px 8px'
                                    }}
                                  >
                                    <X size={14} />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>No bookings</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            {activeTab === 'active' ? 'All Active Bookings' : 'Booking History'}
          </h2>
          {filteredBookings.length === 0 ? (
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              {activeTab === 'active' ? 'No active bookings yet. Create your first booking above!' : 'No booking history yet.'}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Room</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Guest</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Check-in</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Check-out</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Nights</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Guests</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Created By</th>
                    {activeTab === 'active' && (
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: '500', margin: 0 }}>Room {booking.roomNumber}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{booking.guestName}</td>
                      <td style={{ padding: '12px 16px' }}>{booking.checkIn}</td>
                      <td style={{ padding: '12px 16px' }}>{booking.checkOut}</td>
                      <td style={{ padding: '12px 16px' }}>{booking.nights}</td>
                      <td style={{ padding: '12px 16px' }}>{booking.guests}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: '600', color: '#15803d' }}>₵{booking.totalPrice}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(booking.status === 'active' ? styles.statusActive :
                              booking.status === 'completed' ? styles.statusCompleted :
                              styles.statusCancelled)
                        }}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{booking.createdBy}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      {activeTab === 'active' && (
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              style={{
                                color: '#10b981',
                                background: 'none',
                                border: '1px solid #10b981',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}
                              title="Check-out"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              style={{
                                color: '#ef4444',
                                background: 'none',
                                border: '1px solid #ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'history' && filteredBookings.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                <strong>Total Historical Revenue:</strong> ₵{filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBookingApp;