// src/components/LoaderButton.jsx
import { LoadingButton } from "@mui/lab";
export default function LoaderButton(props){
  return <LoadingButton loadingIndicator="Please wait…" {...props} />;
}
