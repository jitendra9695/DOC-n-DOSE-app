import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("inventory");
  const [newMed, setNewMed] = useState({
    name: "",
    price: "",
    stock: "",
    unit: "tablet",
    manufacturer: "",
    description: "",
  });

  useEffect(() => {
    api.get("/pharmacy/inventory/").then((res) => setMedicines(res.data));
    api.get("/pharmacy/orders/").then((res) => setOrders(res.data));
  }, []);

  const addMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pharmacy/inventory/", newMed);
      toast.success("Medicine added!");
      api.get("/pharmacy/inventory/").then((res) => setMedicines(res.data));
      setNewMed({
        name: "",
        price: "",
        stock: "",
        unit: "tablet",
        manufacturer: "",
        description: "",
      });
    } catch {
      toast.error("Failed to add medicine");
    }
  };

  const updateStock = async (medId, stock) => {
    try {
      await api.patch(`/pharmacy/inventory/${medId}/`, {
        stock: parseInt(stock),
      });
      toast.success("Stock updated!");
      api.get("/pharmacy/inventory/").then((res) => setMedicines(res.data));
    } catch {
      toast.error("Failed");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/pharmacy/orders/${orderId}/`, { status });
      toast.success("Order updated!");
      api.get("/pharmacy/orders/").then((res) => setOrders(res.data));
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Pharmacy Dashboard 💊</h1>

        <div className="flex gap-2 mb-6">
          {["inventory", "orders", "add"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-semibold capitalize ${
                tab === t
                  ? "bg-green-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {t === "add" ? "+ Add Medicine" : t}
            </button>
          ))}
        </div>

        {tab === "inventory" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b font-bold">
              Medicine Inventory ({medicines.length})
            </div>
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-4 border-b flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{med.name}</div>
                  <div className="text-sm text-gray-500">
                    ₹{med.price} | Stock: {med.stock} {med.unit}s
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      med.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {med.is_available ? "Available" : "Out of Stock"}
                  </span>
                  <input
                    type="number"
                    defaultValue={med.stock}
                    className="w-16 border rounded px-2 py-1 text-sm"
                    onBlur={(e) => updateStock(med.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b font-bold">
              Orders ({orders.length})
            </div>
            {orders.map((order) => (
              <div key={order.order_id} className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">Order #{order.order_id}</div>
                    <div className="text-sm text-gray-500">
                      Total: ₹{order.total_amount}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.items
                        .map((i) => `${i.medicine} x${i.quantity}`)
                        .join(", ")}
                    </div>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.order_id, e.target.value)
                    }
                    className="border rounded-lg px-3 py-1 text-sm"
                  >
                    {[
                      "placed",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "add" && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-4">Add New Medicine</h2>
            <form onSubmit={addMedicine} className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Medicine Name",
                  field: "name",
                  type: "text",
                  required: true,
                },
                {
                  label: "Price (₹)",
                  field: "price",
                  type: "number",
                  required: true,
                },
                {
                  label: "Stock",
                  field: "stock",
                  type: "number",
                  required: true,
                },
                { label: "Manufacturer", field: "manufacturer", type: "text" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-sm font-medium mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={newMed[f.field]}
                    required={f.required}
                    onChange={(e) =>
                      setNewMed({ ...newMed, [f.field]: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={newMed.unit}
                  onChange={(e) =>
                    setNewMed({ ...newMed, unit: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {[
                    "tablet",
                    "capsule",
                    "syrup",
                    "injection",
                    "cream",
                    "drops",
                  ].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newMed.description}
                  onChange={(e) =>
                    setNewMed({ ...newMed, description: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
