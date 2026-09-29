import { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Tooltip } from "antd";
import {
  HeartFilled,
  ShopFilled,
  DollarOutlined,
  UserOutlined,
  MailOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  CheckOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useCreateManualDonationMutation } from "@/redux/features/donations/donationsApi";
import type {
  DONATION_PAYMENT_METHOD,
  CreateManualDonationPayload,
} from "@/redux/features/donations/donations.types";

interface RecordManualDonationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordManualDonationModal({
  open,
  onClose,
  onSuccess,
}: RecordManualDonationModalProps) {
  const [form] = Form.useForm();
  const [entryType, setEntryType] = useState<"donation" | "fund_raising">("donation");
  const [createManualDonation, { isLoading }] = useCreateManualDonationMutation();

  const handleFinish = async (values: any) => {
    try {
      const payload: CreateManualDonationPayload = {
        name: values.name.trim(),
        email: values.email ? values.email.trim() : undefined,
        amount: Number(values.amount),
        type: entryType,
        payment_method: values.payment_method as DONATION_PAYMENT_METHOD,
        reference: values.reference ? values.reference.trim() : undefined,
        notes: values.notes ? values.notes.trim() : undefined,
      };

      await createManualDonation(payload).unwrap();
      toast.success(
        payload.type === "donation"
          ? "Manual donation successfully recorded & fund synchronized"
          : "Fundraising sale recorded & fund synchronized"
      );
      form.resetFields();
      setEntryType("donation");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record manual transaction");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setEntryType("donation");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
      className="custom-premium-modal"
      title={
        <div className="flex items-center gap-3 pb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-xs transition-colors duration-200 ${
              entryType === "donation" ? "bg-[#0B3D2E]" : "bg-purple-700"
            }`}
          >
            {entryType === "donation" ? (
              <HeartFilled className="text-lg" />
            ) : (
              <ShopFilled className="text-lg" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 font-display m-0 leading-tight">
              Record Offline Transaction
            </h3>
            <p className="text-xs text-mist-500 m-0 mt-0.5">
              Log manual cash, bank transfer, or merchandise fundraising sale
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          type: "donation",
          payment_method: "cash",
        }}
        className="pt-1 space-y-4"
      >
        {/* Hidden Form field for type */}
        <Form.Item name="type" noStyle>
          <Input type="hidden" value={entryType} />
        </Form.Item>

        {/* Premium Interactive Category Selector Cards */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Transaction Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Philanthropic Donation Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setEntryType("donation");
                form.setFieldValue("type", "donation");
              }}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none text-left ${
                entryType === "donation"
                  ? "bg-emerald-50/90 ring-2 ring-[#0B3D2E] shadow-xs"
                  : "bg-gray-50/80 hover:bg-gray-100/70 ring-1 ring-gray-200/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                  entryType === "donation"
                    ? "bg-[#0B3D2E] text-white shadow-xs"
                    : "bg-white text-gray-400 ring-1 ring-gray-200/50 group-hover:text-emerald-700"
                }`}
              >
                <HeartFilled className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold leading-snug truncate ${
                      entryType === "donation" ? "text-[#0B3D2E]" : "text-gray-800"
                    }`}
                  >
                    Donation
                  </span>
                  {entryType === "donation" && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0B3D2E] text-white text-[9px]">
                      <CheckOutlined />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-mist-500 leading-snug mt-0.5 truncate">
                  Philanthropic contribution
                </p>
              </div>
            </div>

            {/* Fund Raising / Store Sales Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setEntryType("fund_raising");
                form.setFieldValue("type", "fund_raising");
              }}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none text-left ${
                entryType === "fund_raising"
                  ? "bg-purple-50/90 ring-2 ring-purple-700 shadow-xs"
                  : "bg-gray-50/80 hover:bg-gray-100/70 ring-1 ring-gray-200/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                  entryType === "fund_raising"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-white text-gray-400 ring-1 ring-gray-200/50 group-hover:text-purple-700"
                }`}
              >
                <ShopFilled className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold leading-snug truncate ${
                      entryType === "fund_raising" ? "text-purple-900" : "text-gray-800"
                    }`}
                  >
                    Fund Raising & Sales
                  </span>
                  {entryType === "fund_raising" && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white text-[9px]">
                      <CheckOutlined />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-mist-500 leading-snug mt-0.5 truncate">
                  Merchandise, tickets, event
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contributor Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="name"
            label={
              <span className="text-xs font-semibold text-gray-700">
                {entryType === "donation" ? "Donor Name" : "Buyer / Organization Name"}
              </span>
            }
            rules={[{ required: true, message: "Please provide a contributor name" }]}
            className="mb-0"
          >
            <Input
              prefix={<UserOutlined className="text-gray-400 mr-1" />}
              placeholder={entryType === "donation" ? "e.g. Marie Laurent" : "e.g. Gala Merchandise Booth"}
              className="h-10 rounded-xl bg-gray-50/60 hover:bg-white focus:bg-white transition-all text-xs"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <span>Email Address (Optional)</span>
                <Tooltip title="If provided, an official tax receipt acknowledgment is sent to the supporter">
                  <QuestionCircleOutlined className="text-gray-400 text-xs hover:text-gray-600" />
                </Tooltip>
              </span>
            }
            rules={[{ type: "email", message: "Please enter a valid email address" }]}
            className="mb-0"
          >
            <Input
              prefix={<MailOutlined className="text-gray-400 mr-1" />}
              placeholder="supporter@example.com"
              className="h-10 rounded-xl bg-gray-50/60 hover:bg-white focus:bg-white transition-all text-xs"
            />
          </Form.Item>
        </div>

        {/* Amount & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="amount"
            label={<span className="text-xs font-semibold text-gray-700">Amount (USD)</span>}
            rules={[
              { required: true, message: "Please enter the amount" },
              {
                validator: (_, value) => {
                  if (value && value > 0) return Promise.resolve();
                  return Promise.reject(new Error("Amount must be greater than $0"));
                },
              },
            ]}
            className="mb-0"
          >
            <InputNumber
              prefix={<DollarOutlined className="text-gray-400 mr-1" />}
              min={0.01}
              precision={2}
              placeholder="0.00"
              className="h-10 w-full rounded-xl flex items-center bg-gray-50/60 hover:bg-white focus:bg-white transition-all font-display font-semibold text-xs"
            />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label={<span className="text-xs font-semibold text-gray-700">Payment Method</span>}
            rules={[{ required: true, message: "Select payment method" }]}
            className="mb-0"
          >
            <Select
              className="h-10 rounded-xl w-full"
              options={[
                { value: "cash", label: "💵 Cash in Person" },
                { value: "bank_transfer", label: "🏦 Direct Bank Transfer / ACH" },
                { value: "direct", label: "💳 Direct Wire Transfer" },
                { value: "stripe", label: "⚡ Stripe Offline POS / Invoice" },
                { value: "other", label: "📋 Other / Cheque" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Reference / Receipt Number */}
        <Form.Item
          name="reference"
          label={
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <span>Receipt # or Internal Reference</span>
              <Tooltip title="E.g. Cash voucher #, check reference, bank wire ID, or event booth tag">
                <QuestionCircleOutlined className="text-gray-400 text-xs hover:text-gray-600" />
              </Tooltip>
            </span>
          }
          className="mb-0"
        >
          <Input
            prefix={<TagOutlined className="text-gray-400 mr-1" />}
            placeholder="e.g. CASH-GALA-0929 or WIRE-BOA-8491"
            className="h-10 rounded-xl font-mono text-xs bg-gray-50/60 hover:bg-white focus:bg-white transition-all"
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label={<span className="text-xs font-semibold text-gray-700">Internal Notes / Description</span>}
          className="mb-2"
        >
          <Input.TextArea
            rows={2}
            placeholder={
              entryType === "donation"
                ? "e.g. Direct cash donation handed over at the community outreach seminar."
                : "e.g. 2 x T-shirts and 1 x cap sold at the annual Diaspora conference booth."
            }
            className="rounded-xl text-xs bg-gray-50/60 hover:bg-white focus:bg-white transition-all p-2.5"
          />
        </Form.Item>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            onClick={handleClose}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl font-medium text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 border-0 transition-colors"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={<PlusCircleOutlined />}
            className={`h-10 px-6 rounded-xl text-white! font-semibold border-0 shadow-sm transition-all duration-200 ${
              entryType === "donation"
                ? "bg-[#0B3D2E]! hover:bg-[#072a20]!"
                : "bg-purple-700! hover:bg-purple-800!"
            }`}
          >
            Save & Sync Fund
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

