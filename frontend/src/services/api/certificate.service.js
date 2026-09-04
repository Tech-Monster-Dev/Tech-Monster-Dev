import api from "./axios";
import { API } from "./endpoints";

export const getMyCertificates = () =>
  api.get(API.CERTIFICATES.MY);

export const downloadCertificate = (certificateId) =>
  api.get(API.CERTIFICATES.DOWNLOAD(certificateId), { responseType: "blob" });
