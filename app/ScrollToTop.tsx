import React from "react";

interface ScrollToTopProps {
  showScroll: boolean;
  onClick: () => void;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ showScroll, onClick }) => {
  if (!showScroll) return null;

  return (
    <div
      onClick={onClick}
      style={styles.button}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = styles.hover.boxShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = styles.button.boxShadow;
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={styles.icon}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </div>
  );
};

const styles = {
  button: {
    position: "fixed",
    bottom: "100px",
    right: "20px",
    backgroundColor: "#6B46C1", // Violet primary accent color
    color: "white",
    padding: "12px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 8px 15px rgba(107, 70, 193, 0.3)", // Violet shadow
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  hover: {
    boxShadow: "0 12px 20px rgba(107, 70, 193, 0.4)", // Hover shadow
  },
  icon: {
    width: "16px",
    height: "16px",
  },
};

export default ScrollToTop;
