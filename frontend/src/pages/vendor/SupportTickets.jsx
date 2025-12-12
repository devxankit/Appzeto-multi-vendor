import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiSearch, FiPlus, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../components/Admin/DataTable';
import Badge from '../../components/Badge';
import AnimatedSelect from '../../components/Admin/AnimatedSelect';
import { useVendorAuthStore } from '../../store/vendorAuthStore';
import toast from 'react-hot-toast';

const SupportTickets = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const vendorId = vendor?.id;

  useEffect(() => {
    if (!vendorId) return;

    const savedTickets = localStorage.getItem(`vendor-${vendorId}-tickets`);
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, [vendorId]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (ticketData) => {
    const updated = [...tickets, { ...ticketData, id: `TKT-${Date.now()}`, vendorId, createdAt: new Date().toISOString(), status: 'open' }];
    setTickets(updated);
    localStorage.setItem(`vendor-${vendorId}-tickets`, JSON.stringify(updated));
    setShowForm(false);
    toast.success('Ticket created successfully');
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default',
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'id',
      label: 'Ticket ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={getStatusVariant(value)}>{value}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/vendor/support-tickets/${row.id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <FiEye />
        </button>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view tickets</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiMessageSquare className="text-primary-600" />
            Support Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage support tickets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
          <FiPlus />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length > 0 ? (
        <DataTable
          data={filteredTickets}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No tickets found</p>
        </div>
      )}

      {showForm && (
        <TicketForm
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};

const TicketForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    type: 'Technical Support',
    priority: 'medium',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Create Support Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option>Technical Support</option>
                <option>Billing Inquiry</option>
                <option>Product Inquiry</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="6"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportTickets;

