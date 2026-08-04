import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { categoriesApi } from "@/api/categories.api";
import { PageHeader } from "@/components/ui/PageHeader";
import { AsyncBoundary } from "@/components/ui/AsyncStates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.list();
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        setError(response.data.error || "Failed to fetch categories");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching categories",
      );
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim())
      return toast.error("Category name cannot be empty");

    setSubmitting(true);
    try {
      // Backend returns the single created row as `data`, not an array.
      const response = await categoriesApi.create({ category: newCategory });
      if (response.data.success) {
        setCategories((prev) => [...prev, response.data.data]);
        setNewCategory("");
        toast.success("Category added");
      } else {
        toast.error(response.data.error || "Failed to add category");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Error adding category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize honeytokens into custom groupings"
      />
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="max-w-xs"
            />
            <Button onClick={addCategory} disabled={submitting}>
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          </div>

          <AsyncBoundary
            loading={loading}
            error={error}
            isEmpty={categories.length === 0}
            emptyMessage="No categories yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-muted-foreground text-mono">
                      {category.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {category.category}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AsyncBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default Category;
