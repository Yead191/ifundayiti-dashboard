import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Button,
  DatePicker,
  Checkbox,
  Tabs,
  Tooltip,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  AppstoreAddOutlined,
  EditOutlined,
  ThunderboltOutlined,
  SkinOutlined,
  DollarOutlined,
  PictureOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { toFileUrl } from "@/config";
import type {
  Product,
  ProductCategory,
  ProductGender,
  ProductStatus,
  ProductVariant,
} from "@/redux/features/shop/product.types";
import {
  GENDERS,
  PRODUCT_STATUSES,
  SIZE_PRESETS,
  DEFAULT_COLORS,
} from "@/redux/features/shop/product.types";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingProduct: Product | null;
  categories: ProductCategory[];
  isLoading: boolean;
}

export function ProductModal({
  open,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  isLoading,
}: ProductModalProps) {
  const [form] = Form.useForm();
  const isEditing = Boolean(editingProduct);
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Media files & existing images state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: "S", color: "Caribbean Navy", stock: 15, isPreOrder: false },
    { size: "M", color: "Caribbean Navy", stock: 25, isPreOrder: false },
    { size: "L", color: "Caribbean Navy", stock: 20, isPreOrder: false },
    { size: "XL", color: "Caribbean Navy", stock: 10, isPreOrder: false },
  ]);

  useEffect(() => {
    if (open) {
      if (editingProduct) {
        const categoryId =
          typeof editingProduct.category === "object" && editingProduct.category
            ? editingProduct.category._id
            : editingProduct.category;

        form.setFieldsValue({
          name: editingProduct.name,
          category: categoryId,
          gender: editingProduct.gender,
          description: editingProduct.description,
          tags: editingProduct.tags || [],
          price: editingProduct.price,
          compareAtPrice: editingProduct.compareAtPrice,
          status: editingProduct.status,
          featured: editingProduct.featured ?? false,
        });

        setVariants(
          editingProduct.variants && editingProduct.variants.length > 0
            ? editingProduct.variants.map((v) => ({ ...v }))
            : [
                {
                  size: "M",
                  color: "Caribbean Navy",
                  stock: 10,
                  isPreOrder: false,
                },
              ],
        );

        setExistingImages(editingProduct.images || []);
        setFileList([]);
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: "unisex",
          status: "active",
          featured: false,
          tags: ["apparel", "organic-cotton"],
          description:
            "<p>Crafted with premium organic cotton and tailored for a relaxed, ethical fit.</p>",
        });
        setVariants([
          { size: "S", color: "Caribbean Navy", stock: 15, isPreOrder: false },
          { size: "M", color: "Caribbean Navy", stock: 25, isPreOrder: false },
          { size: "L", color: "Caribbean Navy", stock: 20, isPreOrder: false },
          { size: "XL", color: "Caribbean Navy", stock: 10, isPreOrder: false },
        ]);
        setExistingImages([]);
        setFileList([]);
      }
      setActiveTab("basic");
    }
  }, [open, editingProduct, form]);

  // Variant operations
  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { size: "M", color: "Vintage Black", stock: 10, isPreOrder: false },
    ]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: unknown,
  ) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error("Product must have at least one size/color variant");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplySizePresets = (colorName: string = "Caribbean Navy") => {
    const newVariants: ProductVariant[] = ["S", "M", "L", "XL", "XXL"].map(
      (size) => ({
        size,
        color: colorName,
        stock: 20,
        isPreOrder: false,
      }),
    );
    setVariants(newVariants);
    toast.success(`Generated standard S-XXL sizes in ${colorName}`);
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (variants.length === 0) {
        toast.error("Please add at least one variant");
        setActiveTab("variants");
        return;
      }

      // Check image requirement
      if (!isEditing && fileList.length === 0) {
        toast.error("Please upload at least one product photo");
        setActiveTab("media");
        return;
      }

      if (isEditing && existingImages.length === 0 && fileList.length === 0) {
        toast.error("Please keep or upload at least one product photo");
        setActiveTab("media");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name || editingProduct?.name || "");
      formData.append(
        "description",
        values.description || editingProduct?.description || "",
      );
      formData.append(
        "category",
        values.category ||
          (typeof editingProduct?.category === "object"
            ? editingProduct?.category?._id
            : editingProduct?.category) ||
          "",
      );

      // Ensure price is a valid number
      const resolvedPrice =
        values.price !== undefined && values.price !== null
          ? Number(values.price)
          : Number(editingProduct?.price);

      if (isNaN(resolvedPrice)) {
        toast.error("Please enter a valid retail price");
        setActiveTab("pricing");
        return;
      }
      formData.append("price", String(resolvedPrice));

      // Optional compareAtPrice
      const resolvedCompareAtPrice =
        values.compareAtPrice !== undefined &&
        values.compareAtPrice !== null &&
        values.compareAtPrice !== ""
          ? Number(values.compareAtPrice)
          : editingProduct?.compareAtPrice;

      if (
        resolvedCompareAtPrice !== undefined &&
        resolvedCompareAtPrice !== null &&
        !isNaN(resolvedCompareAtPrice)
      ) {
        formData.append("compareAtPrice", String(resolvedCompareAtPrice));
      }

      formData.append(
        "gender",
        values.gender || editingProduct?.gender || "unisex",
      );
      formData.append(
        "status",
        values.status || editingProduct?.status || "active",
      );
      formData.append(
        "featured",
        String(
          values.featured !== undefined
            ? Boolean(values.featured)
            : Boolean(editingProduct?.featured),
        ),
      );

      // JSON stringified tags and variants
      formData.append(
        "tags",
        JSON.stringify(values.tags || editingProduct?.tags || []),
      );

      const cleanedVariants = variants.map((v) => ({
        size: v.size.trim(),
        color: v.color.trim(),
        stock: Number(v.stock) || 0,
        isPreOrder: Boolean(v.isPreOrder),
        expectedAvailableDate: v.isPreOrder
          ? v.expectedAvailableDate || null
          : null,
      }));
      formData.append("variants", JSON.stringify(cleanedVariants));

      // Existing images to retain
      if (isEditing) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      // Append new file uploads
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj as Blob);
        }
      });

      await onSubmit(formData);
    } catch (err: any) {
      if (err?.errorFields?.length > 0) {
        const firstErrorField = err.errorFields[0].name[0];
        if (
          ["price", "compareAtPrice", "status", "featured"].includes(
            firstErrorField,
          )
        ) {
          setActiveTab("pricing");
        } else if (
          ["name", "category", "gender", "description", "tags"].includes(
            firstErrorField,
          )
        ) {
          setActiveTab("basic");
        }
        toast.error(
          err.errorFields[0].errors[0] || "Please fill in all required fields",
        );
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText={isEditing ? "Save Product Changes" : "Publish to Store"}
      cancelText="Cancel"
      width={840}
      destroyOnClose
      okButtonProps={{
        className:
          "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm",
      }}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 text-cloud-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            {isEditing ? <EditOutlined /> : <AppstoreAddOutlined />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-cloud-100">
              {isEditing ? "Edit Apparel Item" : "Add New Apparel Product"}
            </h3>
            <p className="text-xs text-mist-500">
              Configure clothing details, sizing matrices, pricing, and media
              gallery.
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        preserve={true}
        layout="vertical"
        className="mt-2"
        requiredMark="optional"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane={false}
          className="product-modal-tabs"
          items={[
            {
              key: "basic",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <SkinOutlined /> Basic Info
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Form.Item
                    name="name"
                    label={
                      <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                        Product Title
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter product title" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. IFundAyiti French Terry Pullover Hoodie"
                      className="h-10 rounded-xl"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Form.Item
                      name="category"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Category
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select category" },
                      ]}
                    >
                      <Select
                        placeholder="Select category"
                        className="h-10 rounded-xl"
                        options={categories.map((c) => ({
                          label: c.name,
                          value: c._id,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item
                      name="gender"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Gender Classification
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select gender" },
                      ]}
                    >
                      <Select
                        className="h-10 rounded-xl"
                        options={GENDERS.map((g) => ({
                          label: g.label,
                          value: g.value,
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="tags"
                    label={
                      <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                        Search & Style Tags
                      </span>
                    }
                    tooltip="Type custom tags and press Enter (e.g. hoodie, organic, heavyweight, 1804)"
                  >
                    <Select
                      mode="tags"
                      className="min-h-10 rounded-xl"
                      placeholder="Add tags..."
                      tokenSeparators={[","]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={
                      <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                        Detailed Product Description (HTML Editor)
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter Product description",
                      },
                    ]}
                  >
                    <TiptapEditor
                      placeholder="Describe fabric composition (e.g. 450 GSM organic French Terry), fit, care instructions, and social impact..."
                      minHeight={170}
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "pricing",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <DollarOutlined /> Pricing & Status
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Form.Item
                      name="price"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Retail Price ($ USD)
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please enter price" },
                        {
                          type: "number",
                          min: 0,
                          message: "Price must be non-negative",
                        },
                      ]}
                    >
                      <InputNumber
                        className="h-10 w-full rounded-xl"
                        prefix="$"
                        placeholder="35.00"
                        precision={2}
                      />
                    </Form.Item>

                    <Form.Item
                      name="compareAtPrice"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Compare-At Price ($ USD) (Optional)
                        </span>
                      }
                      tooltip="Original price before discount. Must be greater than retail price to show sale badge."
                    >
                      <InputNumber
                        className="h-10 w-full rounded-xl"
                        prefix="$"
                        placeholder="45.00"
                        precision={2}
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Form.Item
                      name="status"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Catalog Status
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please select status" },
                      ]}
                    >
                      <Select
                        className="h-10 rounded-xl"
                        options={PRODUCT_STATUSES.map((s) => ({
                          label: s.label,
                          value: s.value,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item
                      name="featured"
                      valuePropName="checked"
                      label={
                        <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
                          Featured on Homepage Spotlight
                        </span>
                      }
                    >
                      <div className="flex h-10 items-center gap-3">
                        <Switch />
                        <span className="text-xs text-mist-500">
                          Promote in top hero merchandise section
                        </span>
                      </div>
                    </Form.Item>
                  </div>
                </div>
              ),
            },
            {
              key: "media",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <PictureOutlined /> Photos & Media
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  {/* Existing Images when Editing */}
                  {existingImages.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cloud-100">
                        Current Photos ({existingImages.length})
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {existingImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                          >
                            <img
                              src={toFileUrl(img)}
                              alt={`Product ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(idx)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <DeleteOutlined className="text-base" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-center">
                    <Upload
                      fileList={fileList}
                      onChange={handleUploadChange}
                      beforeUpload={() => false}
                      multiple
                      listType="picture"
                      maxCount={10}
                      accept="image/*"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="h-10 rounded-xl font-medium"
                      >
                        Select Photos (Up to 10)
                      </Button>
                    </Upload>
                    <p className="mt-2 text-xs text-mist-500">
                      Upload front, back, on-model, and fabric texture close-ups
                      (PNG, JPG, WEBP).
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "variants",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <UnorderedListOutlined /> Size & Color Matrix (
                  {variants.length})
                </span>
              ),
              children: (
                <div className="space-y-3 pt-2">
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-mist-600">
                        Presets:
                      </span>
                      <Button
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={() => handleApplySizePresets("Caribbean Navy")}
                        className="rounded-lg text-xs"
                      >
                        + Standard Sizes (S, M, L, XL, XXL)
                      </Button>
                      <Button
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={() => handleApplySizePresets("Vintage Black")}
                        className="rounded-lg text-xs"
                      >
                        + Black (S - XXL)
                      </Button>
                    </div>

                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddVariantRow}
                      className="rounded-lg text-xs"
                    >
                      Add Row
                    </Button>
                  </div>

                  {/* Matrix Table */}
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-mist-600">
                        <tr>
                          <th className="p-2.5">Size</th>
                          <th className="p-2.5">Color Name</th>
                          <th className="p-2.5 w-24">Stock</th>
                          <th className="p-2.5">Pre-Order?</th>
                          <th className="p-2.5">Expected Dispatch</th>
                          <th className="p-2.5 text-right w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variants.map((variant, index) => (
                          <tr key={index} className="hover:bg-gray-50/50">
                            <td className="p-2">
                              <Select
                                value={variant.size}
                                onChange={(val) =>
                                  handleUpdateVariant(index, "size", val)
                                }
                                className="w-20"
                                options={SIZE_PRESETS.map((s) => ({
                                  label: s,
                                  value: s,
                                }))}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={variant.color}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    index,
                                    "color",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Caribbean Navy"
                                className="w-36 rounded-lg text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <InputNumber
                                value={variant.stock}
                                onChange={(val) =>
                                  handleUpdateVariant(index, "stock", val || 0)
                                }
                                min={0}
                                className="w-20 rounded-lg text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <Checkbox
                                checked={Boolean(variant.isPreOrder)}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    index,
                                    "isPreOrder",
                                    e.target.checked,
                                  )
                                }
                              >
                                <span className="text-[11px]">
                                  Accept Pre-Order
                                </span>
                              </Checkbox>
                            </td>
                            <td className="p-2">
                              {variant.isPreOrder ? (
                                <DatePicker
                                  value={
                                    variant.expectedAvailableDate
                                      ? dayjs(variant.expectedAvailableDate)
                                      : null
                                  }
                                  onChange={(d) =>
                                    handleUpdateVariant(
                                      index,
                                      "expectedAvailableDate",
                                      d ? d.toISOString() : null,
                                    )
                                  }
                                  className="w-32 rounded-lg text-xs"
                                  placeholder="Dispatch date"
                                />
                              ) : (
                                <span className="text-mist-400 text-[11px]">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveVariant(index)}
                                className="h-7 w-7 rounded-md"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
