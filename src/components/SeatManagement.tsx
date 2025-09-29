import React, { useState } from "react";
import { Search } from "lucide-react";
import { Seat, Student } from "../types";

interface SeatManagementProps {
  seats: Seat[];
  students: Student[];
  onAssignSeat: (seatNumber: number, studentId: string) => void;
  onReleaseSeat: (seatNumber: number) => void;
}

const SeatManagement: React.FC<SeatManagementProps> = ({
  seats,
  students,
  onAssignSeat,
  onReleaseSeat,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const availableStudents = students.filter(
    (student) =>
      !student.seatNumber &&
      student.status === "active" &&
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const occupiedSeats = seats.filter((seat) => seat.isOccupied).length;
  const availableSeats = seats.filter((seat) => !seat.isOccupied).length;

  const handleSeatClick = (seat: Seat) => {
    if (seat.isOccupied) {
      setSelectedSeat(seat.number);
    } else {
      setSelectedSeat(seat.number);
      setShowAssignModal(true);
    }
  };

  const handleAssignSeat = (studentId: string) => {
    if (selectedSeat) {
      onAssignSeat(selectedSeat, studentId);
      setShowAssignModal(false);
      setSelectedSeat(null);
      setSearchTerm("");
    }
  };

  const handleReleaseSeat = () => {
    if (selectedSeat) {
      onReleaseSeat(selectedSeat);
      setSelectedSeat(null);
    }
  };

  // 🔹 Utility to render seat buttons
  const renderSeat = (num: number) => {
    const seat = seats.find((s) => s.number === num);
    const isOccupied = seat?.isOccupied;
    return (
      <button
        key={num}
        onClick={() => seat && handleSeatClick(seat)}
        className={`w-10 h-10 rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all hover:scale-105
          ${
            isOccupied
              ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200"
              : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300"
          }`}
      >
        {num}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Seat Management</h2>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Occupied ({occupiedSeats})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Available ({availableSeats})</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Seats</p>
          <p className="text-2xl font-bold text-gray-900">102</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-green-600">{occupiedSeats}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Available</p>
          <p className="text-2xl font-bold text-blue-600">{availableSeats}</p>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seat Layout
        </h3>
        <div className="space-y-6">
          {/* Main Seating Area - 10 rows of 10 seats */}
          <div className="grid grid-cols-10 gap-2 justify-center">
            {Array.from({ length: 100 }, (_, i) => renderSeat(i + 1))}
          </div>
          
          {/* Additional 2 seats */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: 2 }, (_, i) => renderSeat(i + 101))}
          </div>
        </div>
      </div>

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Assign Seat {selectedSeat}
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Student List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableStudents.length > 0 ? (
                availableStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleAssignSeat(student.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">{student.mobile}</div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No available students found
                </p>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSeat(null);
                  setSearchTerm("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Details Modal */}
      {selectedSeat &&
        !showAssignModal &&
        seats.find((s) => s.number === selectedSeat)?.isOccupied && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Seat {selectedSeat} Details
              </h3>
              {(() => {
                const seat = seats.find((s) => s.number === selectedSeat);
                const student = students.find((s) => s.id === seat?.studentId);
                return student ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Student Name
                      </label>
                      <p className="text-gray-900">{student.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mobile
                      </label>
                      <p className="text-gray-900">{student.mobile}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assigned Date
                      </label>
                      <p className="text-gray-900">
                        {seat?.assignedDate
                          ? new Date(seat.assignedDate).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fee Expiry
                      </label>
                      <p className="text-gray-900">
                        {new Date(
                          student.feeExpiryDate
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleReleaseSeat}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Release Seat
                </button>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default SeatManagement;
