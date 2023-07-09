import { CountdownRenderProps } from "react-countdown";

export const CountdownRenderer: React.FC<CountdownRenderProps> = ({
  hours,
  minutes,
  seconds,
  completed,
}) => {
  if (completed) {
    return (
      <span className="bg-red-error-text text-sm px-2 rounded">Expired</span>
    );
  } else {
    const _hours = String(hours).length === 1 ? `0${hours}` : hours;
    const _minutes = String(minutes).length === 1 ? `0${minutes}` : minutes;
    const _seconds = String(seconds).length === 1 ? `0${seconds}` : seconds;
    return (
      <div className="flex">
        <span className="mr-1.5">Expires in:</span>
        <span>
          {_hours}:{_minutes}:{_seconds}
        </span>
      </div>
    );
  }
};
