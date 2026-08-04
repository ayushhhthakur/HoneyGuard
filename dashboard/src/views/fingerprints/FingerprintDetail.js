import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fingerprintsApi } from "@/api/fingerprints.api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/ui/AsyncStates";

const SectionItem = ({ label, value }) => (
  <>
    <div className="flex items-start justify-between gap-3 px-4 py-2.5 text-xs">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="text-right text-muted-foreground break-all">
        {value ?? "N/A"}
      </span>
    </div>
    <Separator />
  </>
);

SectionItem.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
};

const FingerprintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrg } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeOrg || !id) return;

    setLoading(true);
    fingerprintsApi
      .getById(id)
      .then(({ data }) => {
        if (data.success) setRecord(data.data);
        else setError(data.error || "Fingerprint not found");
      })
      .catch((err) =>
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load fingerprint",
        ),
      )
      .finally(() => setLoading(false));
  }, [activeOrg, id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;
  if (!record) return <ErrorState message="No fingerprint data available." />;

  const rawEntries = Object.entries(record.raw || {})
    .filter(
      ([key]) =>
        ![
          "fingerprintHash",
          "canvasHash",
          "webglHash",
          "webglVendor",
          "webglRenderer",
          "audioHash",
        ].includes(key),
    )
    .slice(0, 50);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Fingerprint Details
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Deep client signals for token{" "}
            <code className="text-mono">{record.token}</code>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/fingerprints")}
        >
          Back to list
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal text-foreground">
              Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SectionItem
              label="Token"
              value={<code className="text-mono">{record.token}</code>}
            />
            <SectionItem label="IP Address" value={record.ip_address} />
            <SectionItem label="User Agent" value={record.user_agent} />
            <SectionItem
              label="Created At"
              value={new Date(record.created_at).toLocaleString()}
            />
            <SectionItem
              label="Flag"
              value={
                record.webdriver ? (
                  <Badge variant="destructive">webdriver</Badge>
                ) : (
                  <Badge variant="success">clean</Badge>
                )
              }
            />
            <SectionItem
              label="Private Mode"
              value={
                record.incognito_guess ? (
                  <Badge variant="secondary">possible</Badge>
                ) : (
                  <Badge variant="success">no signal</Badge>
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal text-foreground">
              Device &amp; Rendering
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SectionItem label="Platform" value={record.platform} />
            <SectionItem label="Screen" value={record.screen_resolution} />
            <SectionItem label="Color Depth" value={record.color_depth} />
            <SectionItem label="Pixel Ratio" value={record.pixel_ratio} />
            <SectionItem label="Timezone" value={record.timezone} />
            <SectionItem
              label="Languages"
              value={(record.languages || []).join(", ")}
            />
            <SectionItem
              label="Hardware Concurrency"
              value={record.hardware_concurrency}
            />
            <SectionItem label="Device Memory" value={record.device_memory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal text-foreground">
              Fingerprint Hashes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SectionItem
              label="Fingerprint Hash"
              value={
                <code className="text-mono">{record.fingerprint_hash}</code>
              }
            />
            <SectionItem
              label="Canvas"
              value={<code className="text-mono">{record.canvas_hash}</code>}
            />
            <SectionItem
              label="WebGL"
              value={<code className="text-mono">{record.webgl_hash}</code>}
            />
            <SectionItem label="Vendor" value={record.webgl_vendor} />
            <SectionItem label="Renderer" value={record.webgl_renderer} />
            <SectionItem
              label="Audio"
              value={<code className="text-mono">{record.audio_hash}</code>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal text-foreground">
              Browser Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SectionItem
              label="Fonts"
              value={(record.fonts || []).join(", ") || "none"}
            />
            <SectionItem
              label="Plugins"
              value={(record.plugins || []).join(", ") || "none"}
            />
            <SectionItem
              label="Cookies Enabled"
              value={String(record.cookies_enabled)}
            />
            <SectionItem label="Do Not Track" value={record.do_not_track} />
            <SectionItem
              label="Touch Support"
              value={String(record.touch_support)}
            />
            <SectionItem
              label="Raw Payload Keys"
              value={Object.keys(record.raw || {}).length}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="normal-case tracking-normal text-foreground">
            Raw Payload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap break-words text-xs text-mono text-muted-foreground">
            {JSON.stringify(Object.fromEntries(rawEntries), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default FingerprintDetail;
