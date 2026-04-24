import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import type { Area } from "react-easy-crop";
import { getCroppedSquareJpeg } from "../utils/cropImage";

type Props = {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onApply: (jpegDataUrl: string) => void;
};

export default function ResumePhotoModal({ isOpen, imageSrc, onClose, onApply }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixels(null);
  }, [imageSrc]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !pixels) return;
    setBusy(true);
    try {
      const jpeg = await getCroppedSquareJpeg(imageSrc, pixels);
      onApply(jpeg);
      onClose();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="photo-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      onClick={onClose}
    >
      <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="photo-modal-title">Crop photo</h3>
        <p className="muted small photo-modal-help">
          Drag to reposition, use the slider to zoom. Output is a square (best for CVs). Choose shape and frame below.
        </p>

        {imageSrc ? (
          <div className="photo-modal-crop-wrap">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        ) : null}

        <label className="photo-modal-zoom">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        <div className="photo-modal-actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={() => void handleApply()} disabled={busy || !pixels}>
            {busy ? "Applying…" : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
