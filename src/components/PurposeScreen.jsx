// src/components/PurposeScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Github,
  Linkedin,
  Mail,
  Coffee,
  HelpCircle,
} from "lucide-react";
import AboutModal from "./AboutModal";

export default function PurposeScreen({ onComplete, onSkip }) {
  const [formData, setFormData] = useState({
    title: "",
    purpose: "",
    currentState: "",
    orientationQuestion: "",
  });
  const [showAbout, setShowAbout] = useState(false);
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const creatures = useRef([]);

  // Interactive background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create simple creatures that follow the mouse
    class Creature {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 20 + 10;
        this.vx = 0;
        this.vy = 0;
        this.hue = Math.random() * 60 + 180; // Blue-green range
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update(mouseX, mouseY) {
        // Gentle attraction to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 50) {
          this.vx += (dx / dist) * 0.05;
          this.vy += (dy / dist) * 0.05;
        }

        // Damping
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;

        this.pulsePhase += 0.05;
      }

      draw(ctx) {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
        const currentSize = this.size * pulse;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow effect
        const gradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          currentSize * 2
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, 0.4)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, 0.2)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(
          -currentSize * 2,
          -currentSize * 2,
          currentSize * 4,
          currentSize * 4
        );

        // Core body
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, 0.6)`;
        ctx.beginPath();
        ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = `hsla(${this.hue}, 70%, 80%, 0.4)`;
        ctx.beginPath();
        ctx.arc(
          -currentSize * 0.3,
          -currentSize * 0.3,
          currentSize * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize creatures
    for (let i = 0; i < 15; i++) {
      creatures.current.push(new Creature());
    }

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.fillStyle = "rgba(10, 15, 30, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      creatures.current.forEach((creature) => {
        creature.update(mousePos.current.x, mousePos.current.y);
        creature.draw(ctx);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse tracking
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please give your perception map a title");
      return;
    }
    onComplete(formData);
  };

  const handleSkip = () => {
    onSkip({
      title: "Untitled Perception Map",
      purpose: "",
      currentState: "",
      orientationQuestion: "",
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!window.confirm("This will replace the current form. Continue?")) {
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.purposeData && !data.nodes) {
          alert("Invalid perception map file");
          return;
        }

        // If it has purposeData, use it; otherwise check for nodes/edges
        if (data.purposeData) {
          onComplete(data);
        } else {
          alert(
            "This file doesn't contain purpose data. It will be imported on the canvas."
          );
          onSkip({
            title: "Imported Map",
            purpose: "",
            currentState: "",
            orientationQuestion: "",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import file. Please check the file format.");
      }
    };
    input.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0A0F1E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Logo - Top Left */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src="/logo.PNG"
          alt="Chroma Logo"
          style={{
            width: "48px",
            height: "48px",
            filter: "drop-shadow(0 4px 12px rgba(108, 99, 255, 0.4))",
          }}
        />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #6C63FF 0%, #4D9FFF 50%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, #A78BFA 0%, #6C63FF 50%, #4D9FFF 100%)";
              e.target.style.WebkitBackgroundClip = "text";
              e.target.style.backgroundClip = "text";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, #6C63FF 0%, #4D9FFF 50%, #A78BFA 100%)";
              e.target.style.WebkitBackgroundClip = "text";
              e.target.style.backgroundClip = "text";
            }}
          >
            Chroma
          </h1>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "#94A3B8",
              fontWeight: 500,
              letterSpacing: "0.3px",
            }}
          >
            Your Perception, Amplified
          </p>
        </div>
      </div>

      {/* Form card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "500px",
          maxWidth: "90vw",
          background: "rgba(15, 23, 36, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          padding: "40px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <Sparkles size={22} color="#6C63FF" />
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 600,
                color: "#E6EEF8",
              }}
            >
              Begin Your Journey
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              color: "#94A3B8",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Take a moment to set your intention
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#E6EEF8",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Map Title <span style={{ color: "#6C63FF" }}>*</span>
            </label>
            <input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Morning Reflection, Work Tensions..."
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                color: "#E6EEF8",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6C63FF";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#E6EEF8",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Session Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purpose: e.target.value }))
              }
              placeholder="What are you hoping to understand?"
              rows={2}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                color: "#E6EEF8",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6C63FF";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#E6EEF8",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Current State
            </label>
            <textarea
              value={formData.currentState}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentState: e.target.value,
                }))
              }
              placeholder="How are you feeling right now?"
              rows={2}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                color: "#E6EEF8",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6C63FF";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                color: "#E6EEF8",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
              }}
            >
              Guiding Question
            </label>
            <textarea
              value={formData.orientationQuestion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orientationQuestion: e.target.value,
                }))
              }
              placeholder="What question are you holding?"
              rows={2}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                color: "#E6EEF8",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6C63FF";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleImport}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              color: "#10B981",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              marginBottom: "12px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(16, 185, 129, 0.2)";
              e.target.style.borderColor = "rgba(16, 185, 129, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(16, 185, 129, 0.1)";
              e.target.style.borderColor = "rgba(16, 185, 129, 0.3)";
            }}
          >
            <Upload size={18} /> Import Existing Map
          </button>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(108, 99, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(108, 99, 255, 0.3)";
            }}
          >
            Begin Mapping <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "6px",
              background: "transparent",
              border: "none",
              color: "#64748B",
              fontSize: "12px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#94A3B8")}
            onMouseLeave={(e) => (e.target.style.color = "#64748B")}
          >
            Skip for now
          </button>
        </form>
      </div>
      {/* What's This Button - Bottom Left */}
      <button
        onClick={() => setShowAbout(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 2,
          padding: "14px",
          background:
            "linear-gradient(135deg, rgba(108, 99, 255, 0.2) 0%, rgba(77, 159, 255, 0.1) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          borderRadius: "50%",
          color: "#6C63FF",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          boxShadow: "0 4px 12px rgba(108, 99, 255, 0.2)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 20px rgba(108, 99, 255, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 12px rgba(108, 99, 255, 0.2)";
        }}
      >
        <HelpCircle size={28} />
      </button>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Footer - Socials & Copyright */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {/* Social Links */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px",
            background: "rgba(15, 23, 36, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            border: "1px solid rgba(108, 99, 255, 0.2)",
          }}
        >
          <a
            href="https://github.com/Oceanyx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#88CCFF", transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <Github size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/oceanyx/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4D9FFF", transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <Linkedin size={24} />
          </a>
          <a
            href="mailto:bchanyx@gmail.com"
            style={{ color: "#10B981", transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <Mail size={24} />
          </a>
          <a
            href="https://ko-fi.com/oceanyx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#FF5E5B", transition: "transform 0.2s" }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <Coffee size={24} />
          </a>
        </div>

        {/* Copyright */}
        <div
          style={{
            fontSize: "12px",
            color: "#64748B",
            textAlign: "right",
          }}
        >
          © 2025 Oceanyx · Brian Chan
        </div>
      </div>
    </div>
  );
}
