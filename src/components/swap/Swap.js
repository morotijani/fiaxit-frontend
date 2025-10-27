import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import MainNav from '../MainNav'

function Main() {
    const [authStore, authDispatch] = useContext(AuthContext);


return (
  <div
    className="d-flex justify-content-center align-items-center bg-light"
    style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f7f9fc, #eef1f5)",
    }}
  >
    <div
      className="card shadow-sm border-0 p-0 d-flex flex-column"
      style={{
        width: "360px",
        borderRadius: "25px",
        height: "90vh",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      {/* Scrollable Main Content */}
      <div
        className="flex-grow-1 overflow-auto p-4 main-page-scroll"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Swap</h5>
            <span className="badge bg-light text-dark border">1%</span>
          </div>
        </div>

        {/* You Pay */}
        <div className="bg-light p-3 rounded-4 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">You Pay</span>
            <div className="d-flex align-items-center">
              <img
                src="/eth.png"
                alt="ETH"
                style={{ width: "20px", height: "20px", marginRight: "5px" }}
              />
              <select
                className="form-select form-select-sm border-0 bg-transparent"
                style={{ width: "80px" }}
              >
                <option>ETH</option>
                <option>BTC</option>
              </select>
            </div>
          </div>
          <h5 className="mb-0 fw-bold">0.006</h5>
          <small className="text-muted">$19.06</small>
        </div>

        {/* Swap Icon */}
        <div className="text-center mb-3">
          <button
            className="btn btn-light rounded-circle shadow-sm"
            style={{ width: "40px", height: "40px" }}
          >
            ↕
          </button>
        </div>

        {/* You Receive */}
        <div className="bg-light p-3 rounded-4 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">You Receive</span>
            <div className="d-flex align-items-center">
              <img
                src="/usdt.png"
                alt="USDT"
                style={{ width: "20px", height: "20px", marginRight: "5px" }}
              />
              <select
                className="form-select form-select-sm border-0 bg-transparent"
                style={{ width: "80px" }}
              >
                <option>USDT</option>
                <option>USDC</option>
              </select>
            </div>
          </div>
          <h5 className="mb-0 fw-bold">18.900179</h5>
          <small className="text-muted">$18.88</small>
        </div>

        {/* Percent Buttons */}
        <div className="d-flex justify-content-between mb-3">
          {["5%", "25%", "50%", "75%", "Max"].map((p) => (
            <button key={p} className="btn btn-outline-secondary btn-sm px-3">
              {p}
            </button>
          ))}
        </div>

        {/* Swap Button */}
        <button
          className="btn w-100 fw-bold"
          style={{
            backgroundColor: "#C7FF4A",
            color: "#000",
            borderRadius: "12px",
          }}
        >
          Swap
        </button>

        {/* Details */}
        <div className="mt-4 small text-muted">
          <div className="d-flex justify-content-between">
            <span>Provider</span>
            <span>RingSwap via 0x</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price</span>
            <span>1 ETH ≈ 3,143.94 USDT</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Fees</span>
            <span>$0.000385771</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price Impact</span>
            <span>0%</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Slippage</span>
            <span>0.50%</span>
          </div>
        </div>
        <div className="mt-4 small text-muted">
          <div className="d-flex justify-content-between">
            <span>Provider</span>
            <span>RingSwap via 0x</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price</span>
            <span>1 ETH ≈ 3,143.94 USDT</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Fees</span>
            <span>$0.000385771</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price Impact</span>
            <span>0%</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Slippage</span>
            <span>0.50%</span>
          </div>
        </div>
        <div className="mt-4 small text-muted">
          <div className="d-flex justify-content-between">
            <span>Provider</span>
            <span>RingSwap via 0x</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price</span>
            <span>1 ETH ≈ 3,143.94 USDT</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Fees</span>
            <span>$0.000385771</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price Impact</span>
            <span>0%</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Slippage</span>
            <span>0.50%</span>
          </div>
        </div>
        <div className="mt-4 small text-muted">
          <div className="d-flex justify-content-between">
            <span>Provider</span>
            <span>RingSwap via 0x</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price</span>
            <span>1 ETH ≈ 3,143.94 USDT</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Fees</span>
            <span>$0.000385771</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Price Impact</span>
            <span>0%</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Slippage</span>
            <span>0.50%</span>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div
        className="border-top py-2 bg-white"
        style={{
          position: "sticky",
          bottom: 0,
        }}
      >
        <div className="d-flex justify-content-around text-center">
          <div>
            🏠
            <br />
            <small>Home</small>
          </div>
          <div>
            💱
            <br />
            <small>DeFi</small>
          </div>
          <div>
            🔄
            <br />
            <small>Activity</small>
          </div>
          <div>
            ⚙️
            <br />
            <small>Settings</small>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default Main;