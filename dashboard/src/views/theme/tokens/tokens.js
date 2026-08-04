import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  File,
  Cloud,
  Lock,
  Code,
  Briefcase,
  UploadCloud,
  ArrowLeft,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { tokensApi } from "@/api/tokens.api";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonRows } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FAMILY_ICON = {
  documents: File,
  cloud_credentials: Cloud,
  credentials: Lock,
  devtools: Code,
  business_documents: Briefcase,
};

const normalizeTypesByFamily = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  return Object.entries(payload).map(([family, types]) => ({
    family,
    familyLabel: types?.[0]?.familyLabel || family,
    types: Array.isArray(types) ? types : [],
  }));
};

const Tokens = () => {
  const navigate = useNavigate();
  const [typesByFamily, setTypesByFamily] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [fieldValues, setFieldValues] = useState({});
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    tokensApi
      .listTypes()
      .then(({ data }) => setTypesByFamily(normalizeTypesByFamily(data.data)))
      .catch(() => toast.error("Failed to load honeytoken types"))
      .finally(() => setLoadingTypes(false));
  }, []);

  const selectType = (typeDef) => {
    setSelectedType(typeDef);
    setFieldValues({});
    setFile(null);
    setError(null);
    const first = typeDef.fields?.[0];
    if (first) setFieldValues({ [first.name]: first.default || "" });
  };

  const reset = () => {
    setSelectedType(null);
    setResult(null);
    setTokenName("");
    setDescription("");
    setTagsInput("");
    setFieldValues({});
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) return;
    if (selectedType.requiresUpload && !file) {
      setError("Please select an image file to upload");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("tokenName", tokenName);
      formData.append("description", description);
      formData.append("tokenType", selectedType.key);
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tags));
      Object.entries(fieldValues).forEach(
        ([k, v]) => v && formData.append(k, v),
      );
      if (file) formData.append("file", file);

      const { data } = await tokensApi.create(formData);
      setResult(data);
      toast.success(`${selectedType.label} honeytoken deployed`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate token");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  // ---- Result screen ----
  if (result) {
    return (
      <WidgetCard title="Honeytoken Deployed" icon={CheckCircle2}>
        <p className="mb-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {selectedType?.label}
          </span>{" "}
          &middot; {tokenName}
        </p>
        {result.imageUrl && (
          <div className="mb-3">
            <div className="mb-1 text-xs text-muted-foreground">Preview</div>
            <img
              src={result.imageUrl}
              alt="honeytoken"
              className="max-w-[240px] rounded-lg border border-border"
            />
          </div>
        )}
        <div className="mb-1 text-xs text-muted-foreground">
          Tracking identifier
        </div>
        <div className="mb-3 flex items-center gap-2">
          <code className="flex-1 break-all rounded-lg bg-muted p-2 text-xs text-mono">
            {result.token}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(result.token)}
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        {copied && (
          <div className="mb-2 text-xs text-success">Copied to clipboard</div>
        )}
        {selectedType?.trackingNote && (
          <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">
              How this is tracked:{" "}
            </span>
            {selectedType.trackingNote}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            Deploy another
          </Button>
          <Button size="sm" onClick={() => navigate("/utils/track")}>
            View deployed tokens
          </Button>
        </div>
      </WidgetCard>
    );
  }

  // ---- Step 2: configure the chosen type ----
  if (selectedType) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-muted-foreground"
          onClick={() => setSelectedType(null)}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to catalogue
        </Button>

        <WidgetCard title={`Deploy: ${selectedType.label}`}>
          <p className="mb-4 text-xs text-muted-foreground">
            {selectedType.description}
          </p>

          {error && (
            <div className="mb-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="tokenName">Name</Label>
              <Input
                id="tokenName"
                placeholder="e.g. Finance shared drive decoy"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="finance, q3, external-share"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            {selectedType.fields?.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.type === "select" ? (
                  <Select
                    value={fieldValues[field.name] ?? field.default ?? ""}
                    onValueChange={(v) =>
                      setFieldValues((f) => ({ ...f, [field.name]: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={fieldValues[field.name] || ""}
                    onChange={(e) =>
                      setFieldValues((f) => ({
                        ...f,
                        [field.name]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}

            {selectedType.requiresUpload && (
              <div className="space-y-1.5">
                <Label>Image file</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input py-8 hover:border-primary/40"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {file ? file.name : "Click to select an image"}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Deploying…" : `Deploy ${selectedType.label}`}
            </Button>
          </form>
        </WidgetCard>
      </div>
    );
  }

  // ---- Step 1: catalogue ----
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">
        Deploy a Honeytoken
      </h2>
      <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
        Choose from 27 supported types across five categories.
      </p>

      {loadingTypes ? (
        <SkeletonRows rows={6} />
      ) : !typesByFamily || typesByFamily.length === 0 ? (
        <EmptyState>No token types available.</EmptyState>
      ) : (
        typesByFamily.map(({ family, familyLabel, types }) => {
          const FamilyIcon = FAMILY_ICON[family] || File;
          return (
            <div key={family} className="mb-5">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FamilyIcon className="h-3.5 w-3.5" />
                {familyLabel || family}
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                {types.map((t) => (
                  <Card
                    key={t.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectType(t)}
                    onKeyDown={(e) => e.key === "Enter" && selectType(t)}
                    className={cn(
                      "cursor-pointer p-3 transition-colors hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="mb-1 text-xs font-semibold">
                        {t.label}
                      </div>
                      <div className="text-[11px] leading-relaxed text-muted-foreground">
                        {t.description}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Tokens;
