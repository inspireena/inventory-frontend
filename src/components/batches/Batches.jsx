import React, { useState, useEffect } from 'react';
import { Space, Button, Modal, Popover } from 'antd';
import api from '../../utils/api';
import AddBatchForm from './AddBatchForm';
import EditBatchForm from './EditBatchForm';
import dayjs from 'dayjs';
import CustomTable from '../common/CustomTable';

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editBatchData, setEditBatchData] = useState({});
    const [isAddModal, setIsAddModal] = useState(false)


    const fetchBatches = async (page = pagination.current, pageSize = pagination.pageSize) => {
        try {
            const response = await api.request('get', '/api/batch');
            setBatches(response.data);
            setPagination({
                current: page,
                pageSize,
                total: response.data.length,
            });
        } catch (error) {
            console.error('Error fetching panels:', error);
        }
    };

    const handleEdit = (panel) => {
        setEditBatchData(panel);
        setEditModalVisible(true);
    };

    useEffect(() => {
        fetchBatches(pagination.current, pagination.pageSize);
    }, []);

    const readableDate = (dateObject) => {
        return dayjs(new Date(dateObject)).format('YYYY-MM-DD HH:mm:ss');
    }

    const columns = [
        {
            title: 'Asset Number',
            dataIndex: 'AssetNumber',
            key: 'AssetNumber',
        },
        {
            title: 'PCM',
            dataIndex: 'PCM',
            key: 'PCM',
        },
        {
            title: 'DOM',
            dataIndex: 'DOM',
            key: 'DOM',
            render: (DOM) => dayjs(new Date(DOM)).format('YYYY/MM'),
        },
        {
            title: 'Dispatched',
            dataIndex: 'Dispatched',
            key: 'Dispatched',
            render: (Dispatched) => Dispatched ? readableDate(Dispatched) : 'NA',
        },
        {
            title: 'receivedAt',
            dataIndex: 'receivedAt',
            key: 'receivedAt',
            render: (receivedAt) => receivedAt ? readableDate(receivedAt) : 'NA',
        },
        {
            title: 'received',
            dataIndex: 'received',
            key: 'received',
            render: (received) => received ? 'Yes' : 'No',
        },
        {
            title: 'Total Panels',
            dataIndex: 'panels',
            key: 'panels',
            render: (panels) => panels.length,
        },
        {
            title: 'WhLocation',
            dataIndex: 'WhLocation',
            key: 'WhLocation',
        },
        {
            title: 'Delivery Location',
            dataIndex: 'DeliveryLocation',
            key: 'DeliveryLocation',
        },
        {
            title: 'Customer',
            key: 'user',
            render: (_, record) => (
                <Popover
                    content={record.user.map((user) => user.name).join(', ')}
                    title="Customers"
                    trigger="hover"
                >
                    <div className='table-rendor-button'>View Customers</div>
                </Popover>
            ),
        },
        {
            title: 'Panel',
            key: 'panel',
            render: (_, record) => (
                <Popover
                    content={record.panels.map((panel) => panel.serialNumber).join(', ')}
                    title="Panels"
                    trigger="hover"
                >
                    <div className='table-rendor-button'>View Panels</div>
                </Popover>
            ),
        },
        {
            title: 'Actions',
            dataIndex: '_id',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => handleDispatchPanel(record._id)} type="primary">
                        Make Dispatch
                    </Button>
                    <Button onClick={() => handleReceivePanel(record._id)} type="primary">
                        Mark Receive
                    </Button>
                    <Button onClick={() => handleEdit(record)} type="primary">
                        Edit
                    </Button>
                    <Button onClick={() => handleDeletePanel(record._id)} type="danger">
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const handleDeletePanel = (panelId) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this batch?',
            onOk: async () => {
                try {
                    const response = await api.request('delete', `/api/batch/${panelId}`);
                    fetchBatches(pagination.current, pagination.pageSize);
                } catch (error) {
                    console.error('Error deleting batch:', error);
                }
            },
        });
    };


    const handleReceivePanel = (panelId) => {
        Modal.confirm({
            title: 'Confirm Receive',
            content: 'This will mark this batch as received ?',
            onOk: async () => {
                try {
                    const response = await api.request('put', `/api/batch/${panelId}`, { received: true, receivedAt: new Date().toISOString() });
                    fetchBatches(pagination.current, pagination.pageSize);
                } catch (error) {
                    console.error('Error updating batch:', error);
                }
            },
        });
    };

    const handleDispatchPanel = (panelId) => {
        Modal.confirm({
            title: 'Confirm Dispatch',
            content: 'This will mark this batch as Dispatch ?',
            onOk: async () => {
                try {
                    const response = await api.request('put', `/api/batch/${panelId}`, { Dispatched: new Date().toISOString() });
                    fetchBatches(pagination.current, pagination.pageSize);
                } catch (error) {
                    console.error('Error updating batch Dispatch:', error);
                }
            },
        });
    };

    return (
        <div>
            <Button
                style={{ marginBottom: 10 }}
                onClick={() => setIsAddModal(true)} type="primary">
                Add Batch
            </Button>
            <CustomTable
                downloadButtonText="Export"
                downloadFileName="Batches"
                isFilter={false}
                data={batches}
                columns={columns}
                pagination={pagination}
            />
            {editModalVisible && <EditBatchForm
                editBatchData={editBatchData}
                editModalVisible={editModalVisible}
                onCancel={setEditModalVisible}
                fetchBatches={fetchBatches}
            />
            }
            {isAddModal && <AddBatchForm
                isAddModal={isAddModal}
                fetchBatches={fetchBatches}
                onCancel={setIsAddModal} />}
        </div>
    );
};

export default Batches;
