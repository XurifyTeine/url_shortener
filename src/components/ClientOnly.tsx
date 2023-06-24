import React, { useEffect, useMemo, useState } from "react";

export const ClientOnly: React.FC<React.PropsWithChildren> = (props) => {
  const [render, setRender] = useState(false);

  const children = useMemo(() => {
    return render === true ? props.children : null;
  }, [props.children, render]);

  useEffect(() => {
    setRender(true);
  }, []);

  return <>{children}</>;
};
