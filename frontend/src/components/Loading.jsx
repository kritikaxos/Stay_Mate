import { infinity } from 'ldrs'
infinity.register()
export default function Loading() {
  return (
    <div
      className="loading"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex:"3000"
        
      }}
    >
      <l-infinity
        size="55"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.3"
        color="black"
      ></l-infinity>
    </div>
  );
}
