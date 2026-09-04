import { useState, useEffect } from "react";
import { Modal, Form, Select, InputNumber, Button } from "antd";
import { PlusCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import type { Product } from "@/redux/features/shop/product.types";
import { useIncreaseStockMutation } from "@/redux/features/shop/productsApi";

interface QuickRestockModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export function QuickRestockModal({
  open,
  onClose,
  product,
}: QuickRestockModalProps) {
  const [form] = Form.useForm();
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");
  const [increaseStock, { isLoading }] = useIncreaseStockMutation();

  useEffect(() => {
    if (open && product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      const initialKey = `${firstVariant.size}__${firstVariant.color}`;
      setSelectedVariantKey(initialKey);
      form.setFieldsValue({
        variant: initialKey,
        quantity: 10,
      });
    } else {
      form.resetFields();
    }
  }, [open, product, form]);

  if (!product) return null;

  const variantOptions = (product.variants || []).map((v) => ({
    label: `${v.size} / ${v.color} (Current stock: ${v.stock}${
      v.isPreOrder ? " · Pre-Order" : ""
    })`,
    value: `${v.size}__${v.color}`,
    size: v.size,
    color: v.color,
    currentStock: v.stock,
  }));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const [size, color] = values.variant.split("__");
      await increaseStock({
        productId: product._id,
        size,
        color,
        quantity: Number(values.quantity),
      }).unwrap();

      toast.success(
        `Added +${values.quantity} units to ${size} / ${color} for "${product.name}"`
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to increase stock");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={isLoading}
      okText="Add Inventory"
      cancelText="Cancel"
      width={460}
      destroyOnClose
      okButtonProps={{
        className: "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm",
      }}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 text-cloud-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ThunderboltOutlined className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-cloud-100">
              Quick Variant Restock
            </h3>
            <p className="line-clamp-1 text-xs text-mist-500">
              {product.name}
            </p>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="variant"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Select Size & Color Variant
            </span>
          }
          rules={[{ required: true, message: "Please select a variant" }]}
        >
          <Select
            className="h-10 rounded-xl"
            options={variantOptions}
            onChange={(val) => setSelectedVariantKey(val)}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Quantity to Add (+ Units)
            </span>
          }
          rules={[
            { required: true, message: "Please enter quantity" },
            {
              type: "number",
              min: 1,
              message: "Quantity must be at least 1",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={10000}
            className="h-10 w-full rounded-xl"
            placeholder="e.g. 25"
          />
        </Form.Item>

        {/* Quick Increment Presets */}
        <div className="flex items-center gap-2 pt-1 pb-2">
          <span className="text-xs text-mist-500">Quick add:</span>
          {[5, 10, 25, 50, 100].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => form.setFieldsValue({ quantity: qty })}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-cloud-100 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              +{qty}
            </button>
          ))}
        </div>
      </Form>
    </Modal>
  );
}
