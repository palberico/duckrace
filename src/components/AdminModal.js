import React, { useState } from 'react';
import { Modal, Form, Input, Button, Icon, Message } from 'semantic-ui-react';

const AdminModal = ({
    isOpen,
    setIsOpen,
    email,
    setEmail,
    password,
    setPassword,
    onSubmit,
    authError
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Modal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            closeIcon
            className="admin-modal"
            size="tiny"
        >
            <Modal.Header className="admin-modal-header">
                Admin Login
            </Modal.Header>
            <Modal.Content className="admin-modal-content">
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    This login is restricted to administrators only.
                </p>
                <Form onSubmit={onSubmit}>
                    <Form.Field>
                        <label className="admin-label">Email</label>
                        <Input
                            className="admin-input"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon="mail"
                            iconPosition="left"
                        />
                    </Form.Field>
                    <Form.Field>
                        <label className="admin-label">Password</label>
                        <Input
                            className="admin-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={
                                <Icon
                                    name={showPassword ? 'eye slash' : 'eye'}
                                    link
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                    </Form.Field>
                    <Button type="submit" fluid primary size="large" className="admin-btn">
                        Login
                    </Button>
                    {authError && (
                        <Message negative size="small">
                            {authError}
                        </Message>
                    )}
                </Form>
            </Modal.Content>
        </Modal>
    );
};

export default AdminModal;
