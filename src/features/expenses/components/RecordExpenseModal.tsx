import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Segmented,
  Tooltip,
} from "antd";
import {
  AccountBookOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  CATEGORY_LABELS,
  CATEGORY_SUBCATEGORIES_MAP,
  SUBCATEGORY_LABELS,
  type ExpenseCategory,
  type ExpensePaymentMethod,
  type ExpensePaymentStatus,
  type ExpenseSubcategory,
  type IExpense,
} from "@/redux/features/expenses/expenses.types";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from "@/redux/features/expenses/expensesApi";
import { toast } from "sonner";

interface RecordExpenseModalProps {
  open: boolean;
  expenseToEdit?: IExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordExpenseModal({
  open,
  expenseToEdit,
  onClose,
  onSuccess,
}: RecordExpenseModalProps) {
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory>("business");
  const [paymentStatus, setPaymentStatus] =
    useState<ExpensePaymentStatus>("paid");

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();

  const isEditing = Boolean(expenseToEdit);
  const isLoading = isCreating || isUpdating;

  // Sync form when opening in create or edit mode
  useEffect(() => {
    if (open) {
      if (expenseToEdit) {
        setSelectedCategory(expenseToEdit.category);
        setPaymentStatus(expenseToEdit.payment_status);
        form.setFieldsValue({
          title: expenseToEdit.title,
          amount: expenseToEdit.amount,
          category: expenseToEdit.category,
          subcategory: expenseToEdit.subcategory,
          payment_status: expenseToEdit.payment_status,
          payment_method: expenseToEdit.payment_method,
          expenseDate: dayjs(expenseToEdit.expenseDate),
          reference: expenseToEdit.reference,
          notes: expenseToEdit.notes,
        });
      } else {
        setSelectedCategory("business");
        setPaymentStatus("paid");
        form.setFieldsValue({
          title: "",
          amount: undefined,
          category: "business",
          subcategory: "office_supplies",
          payment_status: "paid",
          payment_method: "cash",
          expenseDate: dayjs(),
          reference: "",
          notes: "",
        });
      }
    } else {
      form.resetFields();
    }
  }, [open, expenseToEdit, form]);

  // Handle category change to update subcategories safely
  const handleCategoryChange = (cat: ExpenseCategory) => {
    setSelectedCategory(cat);
    const validSubs = CATEGORY_SUBCATEGORIES_MAP[cat];
    const currentSub = form.getFieldValue("subcategory");
    if (!validSubs.includes(currentSub)) {
      form.setFieldValue("subcategory", validSubs[0]);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        title: values.title.trim(),
        amount: Number(values.amount),
        category: values.category as ExpenseCategory,
        subcategory: values.subcategory as ExpenseSubcategory,
        payment_status: values.payment_status as ExpensePaymentStatus,
        payment_method: values.payment_method as ExpensePaymentMethod,
        expenseDate: values.expenseDate.toISOString(),
        reference: values.reference ? values.reference.trim() : undefined,
        notes: values.notes ? values.notes.trim() : undefined,
      };

      if (isEditing && expenseToEdit) {
        await updateExpense({ id: expenseToEdit._id, body: payload }).unwrap();
        toast.success("Expense updated successfully");
      } else {
        await createExpense(payload).unwrap();
        toast.success(
          payload.payment_status === "paid"
            ? "Expense recorded & deducted from Program Fund"
            : "Pending expense obligation recorded",
        );
      }

      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          `Failed to ${isEditing ? "update" : "record"} expense`,
      );
    }
  };

  const currentSubcategories = CATEGORY_SUBCATEGORIES_MAP[selectedCategory] || [
    "other",
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className="custom-premium-modal"
      title={
        <div className="flex items-center gap-3 pb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-xs transition-colors duration-200 ${
              paymentStatus === "paid" ? "bg-[#0B3D2E]" : "bg-amber-600"
            }`}
          >
            {isEditing ? (
              <EditOutlined className="text-lg" />
            ) : (
              <AccountBookOutlined className="text-lg" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 font-display m-0 leading-tight">
              {isEditing
                ? "Edit Expense Voucher"
                : "Record Operational Expense"}
            </h3>
            <p className="text-xs text-mist-500 m-0 mt-0.5">
              {isEditing
                ? "Update expense details, amount delta, or payment status"
                : "Log cash, bank transfer, or invoice bill to synchronize fund accounting"}
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-1 space-y-3.5"
      >
        {/* Title */}
        <Form.Item
          name="title"
          label={
            <span className="text-xs font-semibold text-gray-700">
              Expense Title / Description
            </span>
          }
          rules={[
            { required: true, message: "Please provide an expense title" },
          ]}
          className="mb-0"
        >
          <Input
            placeholder="e.g. Fiber Internet Subscription or Sound System Venue Rental"
            className="h-10 rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white text-xs"
          />
        </Form.Item>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="amount"
            label={
              <span className="text-xs font-semibold text-gray-700">
                Amount (USD)
              </span>
            }
            rules={[
              { required: true, message: "Please enter amount" },
              {
                validator: (_, value) => {
                  if (value && value > 0) return Promise.resolve();
                  return Promise.reject(
                    new Error("Amount must be greater than $0"),
                  );
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
              className="h-10 w-full! rounded-xl flex items-center bg-gray-50/70 hover:bg-white focus:bg-white font-display font-semibold text-xs"
            />
          </Form.Item>

          <Form.Item
            name="expenseDate"
            label={
              <span className="text-xs font-semibold text-gray-700">
                Expense Date
              </span>
            }
            rules={[{ required: true, message: "Please select expense date" }]}
            className="mb-0"
          >
            <DatePicker
              format="YYYY-MM-DD"
              className="h-10 w-full rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white text-xs"
            />
          </Form.Item>
        </div>

        {/* Category & Subcategory (Dynamic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="category"
            label={
              <span className="text-xs font-semibold text-gray-700">
                Category
              </span>
            }
            rules={[{ required: true, message: "Select category" }]}
            className="mb-0"
          >
            <Select
              onChange={handleCategoryChange}
              className="h-10 rounded-xl w-full"
              options={[
                { value: "business", label: "Business Operations" },
                { value: "event", label: "Events & Gatherings" },
                { value: "program", label: "Programs & Grants" },
                { value: "other", label: "Other Expenditures" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="subcategory"
            label={
              <span className="text-xs font-semibold text-gray-700">
                Subcategory
              </span>
            }
            rules={[{ required: true, message: "Select subcategory" }]}
            className="mb-0"
          >
            <Select
              className="h-10 rounded-xl w-full"
              options={currentSubcategories.map((subcat) => ({
                value: subcat,
                label: SUBCATEGORY_LABELS[subcat] || subcat,
              }))}
            />
          </Form.Item>
        </div>

        {/* Payment Status & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            name="payment_status"
            label={
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <span>Payment Status</span>
                <Tooltip title="If marked as 'Paid', the amount is immediately deducted from the Program Fund balance">
                  <QuestionCircleOutlined className="text-gray-400 text-xs" />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: "Select payment status" }]}
            className="mb-0"
          >
            <Segmented
              value={paymentStatus}
              onChange={(val) => {
                setPaymentStatus(val as any);
                form.setFieldValue("payment_status", val);
              }}
              block
              className="h-10 p-1 rounded-xl bg-gray-100 font-medium text-xs flex items-center"
              options={[
                {
                  value: "paid",
                  label: (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-800">
                      <CheckCircleOutlined className="text-emerald-600" />
                      <span>Paid (Deduct)</span>
                    </span>
                  ),
                },
                {
                  value: "unpaid",
                  label: (
                    <span className="flex items-center justify-center gap-1.5 text-amber-800">
                      <ClockCircleOutlined className="text-amber-600" />
                      <span>Unpaid (Pending)</span>
                    </span>
                  ),
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label={
              <span className="text-xs font-semibold text-gray-700">
                Payment Method
              </span>
            }
            rules={[{ required: true, message: "Select payment method" }]}
            className="mb-0"
          >
            <Select
              className="h-10 rounded-xl w-full"
              options={[
                { value: "cash", label: "Cash in Hand" },
                {
                  value: "bank_transfer",
                  label: "Direct Bank Transfer / ACH",
                },
                { value: "card", label: "Debit / Credit Card" },
                { value: "direct", label: "Wire Transfer" },
                { value: "other", label: "Other / Cheque" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Reference / Invoice # */}
        <Form.Item
          name="reference"
          label={
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <span>Receipt # or Invoice Reference</span>
              <Tooltip title="Leave blank to auto-generate a unique voucher code (e.g. EXP-A1B2)">
                <QuestionCircleOutlined className="text-gray-400 text-xs hover:text-gray-600" />
              </Tooltip>
            </span>
          }
          className="mb-0"
        >
          <Input
            prefix={<TagOutlined className="text-gray-400 mr-1" />}
            placeholder="e.g. INV-2026-1002 or EXP-NET-01 (Auto-generated if left empty)"
            className="h-10 rounded-xl font-mono text-xs bg-gray-50/70 hover:bg-white focus:bg-white"
          />
        </Form.Item>

        {/* Notes */}
        <Form.Item
          name="notes"
          label={
            <span className="text-xs font-semibold text-gray-700">
              Internal Audit Memo / Notes
            </span>
          }
          className="mb-1"
        >
          <Input.TextArea
            rows={2}
            placeholder="Context, vendor contact, approval details, or purpose of expenditure..."
            className="rounded-xl text-xs bg-gray-50/70 hover:bg-white focus:bg-white p-2.5"
          />
        </Form.Item>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            onClick={() => {
              form.resetFields();
              onClose();
            }}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl font-medium text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 border-0 transition-colors"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            icon={isEditing ? <CheckCircleOutlined /> : <PlusCircleOutlined />}
            className={`h-10 px-6 rounded-xl text-white! font-semibold border-0 shadow-sm transition-all duration-200 ${
              paymentStatus === "paid"
                ? "bg-[#0B3D2E]! hover:bg-[#072a20]!"
                : "bg-amber-600! hover:bg-amber-700!"
            }`}
          >
            {isEditing ? "Save Changes" : "Record & Sync Fund"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
