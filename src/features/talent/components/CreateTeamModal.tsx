import { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, message } from 'antd';
import { AxiosError } from 'axios';
import { useCreateTeam } from '../../../hooks/useTeams';
import { TeamType } from '../../../shared/types/index';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  name: string;
  description?: string;
  type: TeamType;
  subjects: string[];
  isPublic: boolean;
  isDiscoverable: boolean;
}

export const CreateTeamModal = ({ open, onClose }: CreateTeamModalProps) => {
  const [form] = Form.useForm<FormValues>();
  const [isPublic, setIsPublic] = useState(true);
  const { mutate: createTeam, isPending: isLoading } = useCreateTeam();

  const handleSubmit = (values: FormValues) => {
    createTeam(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
      onError: (error: Error) => {
        // Error handling could be added here
        const err = error as AxiosError<{ message: string }>;
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create team';
        message.error(errorMessage);
        console.error('Failed to create team:', error);
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create New Team"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: TeamType.OPEN,
          subjects: [],
          isPublic: true,
          isDiscoverable: true,
        }}
      >
        <Form.Item
          name="name"
          label="Team Name"
          rules={[
            { required: true, message: 'Please enter a team name' },
            { min: 3, message: 'Name must be at least 3 characters' },
            { max: 100, message: 'Name cannot exceed 100 characters' },
          ]}
        >
          <Input placeholder="Enter team name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' },
          ]}
        >
          <Input.TextArea
            placeholder="Enter team description"
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Team Type"
          rules={[{ required: true, message: 'Please select a team type' }]}
        >
          <Select>
            <Select.Option value={TeamType.OPEN}>Open</Select.Option>
            <Select.Option value={TeamType.PRIVATE}>Private</Select.Option>
            <Select.Option value={TeamType.FREELANCE}>Freelance</Select.Option>
            <Select.Option value={TeamType.STARTUP}>Startup</Select.Option>
            <Select.Option value={TeamType.VOLUNTEER}>Volunteer</Select.Option>
            <Select.Option value={TeamType.ORGANIZATION}>Organization</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="subjects"
          label="Subjects"
          tooltip="Add subjects separated by comma or enter"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="e.g. Design, Development, Marketing"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item
          name="isPublic"
          label="Public Team"
          valuePropName="checked"
          tooltip="Anyone can find this team and request to join. Joining still requires approval"
        >
          <Switch onChange={setIsPublic} />
        </Form.Item>

        <Form.Item
          name="isDiscoverable"
          label="Discoverable"
          valuePropName="checked"
          tooltip="This team appears in search and recommendations, but joining requires an invite or approval"
          hidden={!isPublic}
        >
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Team
          </Button>
        </div>
      </Form>
    </Modal>
  );
};