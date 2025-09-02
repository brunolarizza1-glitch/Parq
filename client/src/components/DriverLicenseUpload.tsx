import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DriverLicenseUploadProps {
  onUploadComplete?: (imageUrl: string) => void;
  currentImageUrl?: string;
  children: ReactNode;
}

export function DriverLicenseUpload({
  onUploadComplete,
  currentImageUrl,
  children,
}: DriverLicenseUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async () => {
          try {
            const response = await apiRequest("POST", "/api/objects/upload");
            const data = await response.json();
            return {
              method: "PUT" as const,
              url: data.uploadURL,
            };
          } catch (error) {
            toast({
              title: "Upload Error",
              description: "Failed to get upload URL. Please try again.",
              variant: "destructive",
            });
            throw error;
          }
        },
      })
      .on("complete", async (result) => {
        if (result.successful && result.successful.length > 0) {
          const uploadedFile = result.successful[0];
          const imageUrl = uploadedFile.uploadURL;
          
          try {
            // Set ACL policy for the uploaded image
            const response = await apiRequest("PUT", "/api/driver-license", {
              driverLicenseImageUrl: imageUrl,
            });
            
            if (response.ok) {
              const data = await response.json();
              onUploadComplete?.(data.objectPath);
              toast({
                title: "Upload Successful",
                description: "Your driver's license has been uploaded for verification.",
              });
              setShowModal(false);
            }
          } catch (error) {
            toast({
              title: "Upload Error",
              description: "Failed to process uploaded image. Please try again.",
              variant: "destructive",
            });
          }
        }
      })
  );

  return (
    <div>
      <Button 
        onClick={() => setShowModal(true)} 
        variant={currentImageUrl ? "outline" : "default"}
        data-testid="button-upload-license"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        note="Upload a clear photo of your driver's license for verification. Max file size: 10MB"
      />
    </div>
  );
}