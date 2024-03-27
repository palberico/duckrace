import React from 'react';
import { Modal, Form, Input, Button, Icon } from 'semantic-ui-react';

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

    return (
        <Modal 
          open={isOpen} 
          onClose={() => setIsOpen(false)}
          closeIcon={<Icon name="close" />}
        >
            <Modal.Header>Admin Login - This login is for administrators only. </Modal.Header>
            <Modal.Content>
                <Form onSubmit={onSubmit}>
                    <Form.Field>
                        <label>Email</label>
                        <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Field>
                    <Form.Field>
                        <label>Password</label>
                        <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Form.Field>
                    <Button type="submit">Login</Button>
                    {authError && <div style={{ color: 'red', marginTop: '10px' }}>{authError}</div>}
                </Form>
            </Modal.Content>
        </Modal>
    );
};

export default AdminModal;
