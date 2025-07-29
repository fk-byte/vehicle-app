import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [reservationData, setReservationData] = useState({
    date: '',
    vehicle: '',
    startTime: '',
    endTime: '',
    price: '',
  });

  // Predefined user logins
  const users = [
    { username: 'user1', password: 'pass1' },
    { username: 'user2', password: 'pass2' },
    { username: 'user3', password: 'pass3' },
    { username: 'user4', password: 'pass4' },
  ];

  // Load data from localStorage
  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    const storedReservations = JSON.parse(localStorage.getItem('reservations')) || [];
    setVehicles(storedVehicles);
    setReservations(storedReservations);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [vehicles, reservations]);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setIsLoggedIn(true);
    } else {
      alert('Invalid username or password');
    }
  };

  // Add vehicle
  const addVehicle = () => {
    if (newVehicleName.trim()) {
      setVehicles([...vehicles, { id: Date.now(), name: newVehicleName }]);
      setNewVehicleName('');
    }
  };

  // Remove vehicle
  const removeVehicle = (id) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  // Handle reservation form
  const handleReservationInput = (field, value) => {
    setReservationData({ ...reservationData, [field]: value });
  };

  const submitReservation = () => {
    const newReservation = {
      id: Date.now(),
      ...reservationData,
      start: `${reservationData.date}T${reservationData.startTime}`,
      end: `${reservationData.date}T${reservationData.endTime}`,
    };
    setReservations([...reservations, newReservation]);
    setReservationData({ date: '', vehicle: '', startTime: '', endTime: '', price: '' });
    setFormStep(1);
    setShowReservationForm(false);
  };

  // Get weekly earnings
  const getWeeklyEarnings = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return reservations
      .filter((res) => {
        const resDate = new Date(res.date);
        return resDate >= startOfWeek && resDate <= endOfWeek;
      })
      .reduce((total, res) => total + (parseFloat(res.price) || 0), 0);
  };

  // Get available vehicles for a date
  const getAvailableVehicles = (date) => {
    const bookedVehicles = reservations
      .filter((res) => res.date === date)
      .map((res) => res.vehicle);
    return vehicles.filter((v) => !bookedVehicles.includes(v.name));
  };

  // Calendar events
  const calendarEvents = reservations.map((res) => ({
    title: `${res.vehicle} ($${res.price})`,
    start: res.start,
    end: res.end,
  }));

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Vehicle Rental Management</h1>

      {/* Vehicle Management */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Manage Vehicles</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Vehicle Name"
            value={newVehicleName}
            onChange={(e) => setNewVehicleName(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={addVehicle}
            className="bg-green-500 text-white p-2 rounded"
          >
            Add Vehicle
          </button>
        </div>
        <ul className="list-disc pl-5">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="flex justify-between items-center">
              {vehicle.name}
              <button
                onClick={() => removeVehicle(vehicle.id)}
                className="text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Weekly Earnings */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Weekly Earnings</h2>
        <p>Total: ${getWeeklyEarnings().toFixed(2)}</p>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Reservation Calendar</h2>
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek',
          }}
          events={calendarEvents}
          dateClick={(info) => {
            setReservationData({ ...reservationData, date: info.dateStr.split('T')[0] });
            setShowReservationForm(true);
            setFormStep(1);
          }}
        />
        <p className="mt-2">
          Available Vehicles Today: {getAvailableVehicles(new Date().toISOString().split('T')[0]).length}
        </p>
      </div>

      {/* Reservation Form */}
      {showReservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">New Reservation</h2>
            {formStep === 1 && (
              <div>
                <p>Date: {reservationData.date}</p>
                <label className="block mb-2">Select Vehicle:</label>
                <select
                  value={reservationData.vehicle}
                  onChange={(e) => {
                    handleReservationInput('vehicle', e.target.value);
                    setFormStep(2);
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a vehicle</option>
                  {getAvailableVehicles(reservationData.date).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.name}>
                      {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {formStep === 2 && (
              <div>
                <label className="block mb-2">Start Time:</label>
                <input
                  type="time"
                  value={reservationData.startTime}
                  onChange={(e) => {
                    handleReservationInput('startTime', e.target.value);
                    setFormStep(3);
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {formStep === 3 && (
              <div>
                <label className="block mb-2">End Time:</label>
                <input
                  type="time"
                  value={reservationData.endTime}
                  onChange={(e) => {
                    handleReservationInput('endTime', e.target.value);
                    setFormStep(4);
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {formStep === 4 && (
              <div>
                <label className="block mb-2">Price ($):</label>
                <input
                  type="number"
                  value={reservationData.price}
                  onChange={(e) => handleReservationInput('price', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={submitReservation}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowReservationForm(false)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
