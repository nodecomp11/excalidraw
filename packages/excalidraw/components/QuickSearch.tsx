import clsx from "clsx";
import { useState, useEffect } from "react";
import { searchIcon } from "./icons";

import "./QuickSearch.scss";

interface QuickSearchProps {
  className?: string;
  placeholder: string;
  onChange: (term: string) => void;
}

export const QuickSearch = ({
  className,
  placeholder,
  onChange,
}: QuickSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onChange(searchTerm.trim().toLowerCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className={clsx("QuickSearch__wrapper", className)}>
      {searchIcon}
      <input
        className="QuickSearch__input"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};
