"use client"

import { useEffect, useState } from "react"

const SellerContact = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Modal viewer controls
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState([]) // image array of clicked row
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const token = sessionStorage.getItem("jwtToken")

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/contacts/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) throw new Error("Failed to load contacts")

      const data = await response.json()
      setContacts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------
  // IMAGE VIEWER FUNCTIONS
  // ----------------------

  const openViewer = (images, index) => {
    setSelectedImages(images)
    setCurrentIndex(index)
    setViewerOpen(true)
  }

  const closeViewer = () => setViewerOpen(false)

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev + 1 < selectedImages.length ? prev + 1 : 0
    )
  }

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : selectedImages.length - 1
    )
  }

  if (loading) return <h2 style={{ padding: "20px" }}>Loading contacts...</h2>
  if (error) return <h3 style={{ color: "red", padding: "20px" }}>{error}</h3>

  return (
    <div style={{ padding: "30px" }}>
      <h1>Customer Contact Submissions</h1>
      <p>Total submissions: {contacts.length}</p>

      {/* --------------------------- */}
      {/* IMAGE VIEWER MODAL */}
      {/* --------------------------- */}
      {viewerOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <button style={closeBtn} onClick={closeViewer}>✕</button>

            <button style={navBtnLeft} onClick={prevImage}>⟨</button>

            <img
              src={selectedImages[currentIndex]}
              alt="Preview"
              style={modalImage}
            />

            <button style={navBtnRight} onClick={nextImage}>⟩</button>

            <p style={{ marginTop: "10px" }}>
              Image {currentIndex + 1} of {selectedImages.length}
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f2f2f2", textAlign: "left" }}>
            <th style={thStyle}>Full Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Images</th>
            <th style={thStyle}>Submitted On</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((c, index) => (
            <tr key={index} style={index % 2 === 0 ? rowEven : rowOdd}>
              <td style={tdStyle}>{c.fullName}</td>
              <td style={tdStyle}>{c.emailAddress}</td>
              <td style={tdStyle}>{c.contactNumber}</td>
              <td style={tdStyle}>{c.message}</td>

              <td style={tdStyle}>
                {c.images && c.images.length > 0 ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {c.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Uploaded"
                        onClick={() => openViewer(c.images, i)}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: "1px solid #ccc",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ opacity: 0.7 }}>No Images</span>
                )}
              </td>

              <td style={tdStyle}>
                {new Date(c.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ----------------------
// TABLE STYLING
// ----------------------

const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #ddd",
  fontWeight: "bold",
}

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
}

const rowEven = { background: "#fff" }
const rowOdd = { background: "#fafafa" }

// ----------------------
// MODAL STYLING
// ----------------------

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
}

const modalContent = {
  position: "relative",
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  width: "80%",
  maxWidth: "700px",
}

const modalImage = {
  maxWidth: "100%",
  maxHeight: "70vh",
  borderRadius: "10px",
}

const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  fontSize: "22px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
}

const navBtnLeft = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "32px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "black",
}

const navBtnRight = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "32px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "black",
}

export default SellerContact
