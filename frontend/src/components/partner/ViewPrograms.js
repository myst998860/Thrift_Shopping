import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { programService } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCalendar, FiTarget } from 'react-icons/fi';

const ViewPrograms = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await programService.listPrograms();
            // Assuming the backend returns all programs, we might need to filter by partner ID
            // Ideally backend filters, but if not, we filter here if user ID is available.
            // For now, displaying all returned programs as presumably the API handles permission/filtering
            setPrograms(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Error fetching programs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this program?")) return;
        try {
            await programService.deleteProgram(id);
            setPrograms(prev => prev.filter(p => p.programId !== id));
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete program");
        }
    };

    const filteredPrograms = programs.filter(p =>
        p.programTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading programs...</div>;

    return (
        <div style={{ padding: '20px 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>My Programs</h1>
                    <p style={{ color: '#666' }}>Manage your donation programs and campaigns</p>
                </div>
                <button
                    onClick={() => navigate('/partner/program')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#153c67', color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(21, 60, 103, 0.2)'
                    }}
                >
                    <FiPlus /> Create New Program
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%', maxWidth: 400, padding: '12px', borderRadius: 8,
                    border: '1px solid #ddd', marginBottom: 30, fontSize: 15
                }}
            />

            {/* Grid */}
            {filteredPrograms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: '#f8f9fa', borderRadius: 12 }}>
                    <p style={{ color: '#888', fontSize: 18 }}>No programs found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {filteredPrograms.map(program => (
                        <div key={program.programId} style={{
                            background: 'white', borderRadius: 12, overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee',
                            transition: 'transform 0.2s', position: 'relative'
                        }}>
                            {/* Image Placeholder or Actual Image */}
                            <div style={{ height: 160, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                {program.programImage ? (
                                    <img src={program.programImage} alt={program.programTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>

                            <div style={{ padding: 20 }}>
                                <div style={{ marginBottom: 10 }}>
                                    <span style={{
                                        background: '#e0f2fe', color: '#0369a1', padding: '4px 10px',
                                        borderRadius: 20, fontSize: 12, fontWeight: 700
                                    }}>
                                        {program.category || 'General'}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{program.programTitle}</h3>
                                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {program.description}
                                </p>

                                <div style={{ display: 'flex', gap: 16, color: '#64748b', fontSize: 13, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiCalendar />
                                        {new Date(program.startDate).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiMapPin />
                                        {program.programLocation || 'N/A'}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                    <button
                                        onClick={() => navigate(`/partner/program/edit/${program.programId}`)}
                                        style={{
                                            padding: 8, borderRadius: 6, border: '1px solid #cbd5e1',
                                            background: 'white', color: '#475569', cursor: 'pointer'
                                        }}
                                        title="Edit"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(program.programId)}
                                        style={{
                                            padding: 8, borderRadius: 6, border: '1px solid #fecaca',
                                            background: '#fef2f2', color: '#dc2626', cursor: 'pointer'
                                        }}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewPrograms;
