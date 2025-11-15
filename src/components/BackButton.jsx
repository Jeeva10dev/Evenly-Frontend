import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

// Props:
// - inline: renders as an inline icon-only button (for placing next to headings)
// - to: string | -1 for history back
// - label: accessible label; hidden in inline mode
export default function BackButton({ inline = false, to = -1, label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof to === "string") {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  if (inline) {
    return (
      <Button
        onClick={handleClick}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full ${className}`}
        aria-label={label}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={`absolute top-2 left-2 z-20 ${className}`}>
      <Button
        onClick={handleClick}
        variant="outline"
        className="bg-white/90 backdrop-blur text-black border-gray-300 hover:bg-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}


