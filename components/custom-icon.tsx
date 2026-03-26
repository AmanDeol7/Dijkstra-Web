// Custom icon component
export function CustomIcon({
    iconType,
    className,
  }: {
    iconType: string;
    className?: string;
  }) {
    const iconUrls = {
      git: "https://img.icons8.com/?size=100&id=38389&format=png&color=FFFFFF",
      vscode: "https://img.icons8.com/ios_filled/512/FFFFFF/visual-studio.png",
      leetcode:
        "https://img.icons8.com/?size=100&id=PZknXs9seWCp&format=png&color=FFFFFF",
      career:
        "https://img.icons8.com/?size=100&id=123456&format=png&color=FFFFFF",
    };
  
    switch (iconType) {
      case "git":
      case "vscode":
      case "leetcode":
      case "career":
        return (
          <img
            src={iconUrls[iconType as keyof typeof iconUrls] || "/placeholder.svg"}
            alt={iconType}
            className={className}
            style={{ width: "20px", height: "20px" }}
          />
        );
      default:
        return null;
    }
  }