import React from "react";
import "./GridComponent.css"; // استایل را در فایل جداگانه مدیریت می‌کنیم.

interface CellProps {
  type?: string; // نوع یا استایل سلول (مثل div1، div2 و ...)
}

const Cell: React.FC<CellProps> = ({ type }) => {
  return (
    <div className={`cell ${type ? type : ""}`}>
      {type && <span>{type}</span>}
    </div>
  );
};

interface GridProps {
  rows: number;
  columns: number;
  filledCells?: { row: number; col: number; type: string }[]; // مکان و نوع سلول‌های رنگی
}

const Grid: React.FC<GridProps> = ({ rows, columns, filledCells = [] }) => {
  // ساخت یک آرایه برای پر کردن خانه‌های گرید
  const grid = Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, colIndex) => {
      const filledCell = filledCells.find(
        (cell) => cell.row === rowIndex && cell.col === colIndex
      );
      return filledCell ? (
        <Cell key={`${rowIndex}-${colIndex}`} type={filledCell.type} />
      ) : (
        <Cell key={`${rowIndex}-${colIndex}`} />
      );
    })
  );

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row}
        </div>
      ))}
    </div>
  );
};

export default Grid;
