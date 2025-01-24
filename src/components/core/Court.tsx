import CourtProps from "@/types/court";

const Court = ({
  width = 100,
  height = 50,
  goalWidth = 3,
  borderThickness = 2,
  borderColor = "#ff0000"
}: CourtProps) => {
  // Create the border as 6 separate walls
  return (
    <group>
      {/* Top border */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, borderThickness, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>

      {/* Bottom borders */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[width, borderThickness, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>

      {/* Left borders */}
      <mesh position={[-width / 2, -height / 4 - goalWidth, 0]}>
        <boxGeometry args={[borderThickness, height / 2 - goalWidth * 2, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>
      <mesh position={[-width / 2, height / 4 + goalWidth, 0]}>
        <boxGeometry args={[borderThickness, height / 2 - goalWidth * 2, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>

      {/* Right border */}
      <mesh position={[width / 2, -height / 4 - goalWidth, 0]}>
        <boxGeometry args={[borderThickness, height / 2 - goalWidth * 2, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>
      <mesh position={[width / 2, height / 4 + goalWidth, 0]}>
        <boxGeometry args={[borderThickness, height / 2 - goalWidth * 2, borderThickness]} />
        <meshStandardMaterial color={borderColor} />
      </mesh>
    </group>
  );
}

export default Court;