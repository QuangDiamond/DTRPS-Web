import { Modal } from '@/components/common';
import type { PoiPhoto } from '@/types';

interface PoiPhotoViewerModalProps {
  photo: PoiPhoto;
  onClose: () => void;
}

export default function PoiPhotoViewerModal({ photo, onClose }: PoiPhotoViewerModalProps) {
  return (
    <Modal title={photo.caption} description={photo.meta} size="lg" onClose={onClose}>
      <img
        src={photo.url}
        alt={photo.caption}
        className="max-h-[70vh] w-full rounded-xl object-contain"
      />
    </Modal>
  );
}
