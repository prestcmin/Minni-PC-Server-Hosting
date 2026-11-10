function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state" role="status">
      {message}
    </div>
  );
}

export default LoadingState;
