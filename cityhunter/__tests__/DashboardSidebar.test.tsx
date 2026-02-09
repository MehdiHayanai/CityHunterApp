import { render, screen, fireEvent } from '@testing-library/react';
import DashboardSidebar from '../app/components/dashboard/DashboardSidebar';
import { useDashboardContext } from '../app/context/DashboardContext';

// Mock the context
jest.mock('../app/context/DashboardContext');

const mockContextProps = {
  activeTab: 'Monument',
  setActiveTab: jest.fn(),
  activeCategories: ['all'],
  setActiveCategories: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  activeWalk: null,
  setActiveWalk: jest.fn(),
  excludedStopIds: [],
  setExcludedStopIds: jest.fn(),
  walkStopsOrder: [],
  setWalkStopsOrder: jest.fn(),
  expandedStopId: null,
  setExpandedStopId: jest.fn(),
  questState: { isActive: false, activeWalkId: null },
  updateQuestState: jest.fn(),
  walks: [],
  addWalk: jest.fn(),
  isCreatingWalk: false,
  setIsCreatingWalk: jest.fn(),
  newWalkStops: [],
  setNewWalkStops: jest.fn(),
  setSelectedMonumentId: jest.fn(),
  selectedMonumentId: null,
  setMobileView: jest.fn(),
};

describe('DashboardSidebar', () => {
  beforeEach(() => {
    (useDashboardContext as jest.Mock).mockReturnValue(mockContextProps);
  });

  it('renders the header correctly', () => {
    render(<DashboardSidebar filteredItems={[]} />);
    expect(screen.getByText('City Monuments')).toBeInTheDocument();
  });

  it('renders search bar when not viewing a walk', () => {
    render(<DashboardSidebar filteredItems={[]} />);
    expect(screen.getByPlaceholderText('Search name, address, or coords...')).toBeInTheDocument();
  });

  it('calls setActiveTab when clicking mobile tabs', () => {
    render(<DashboardSidebar filteredItems={[]} />);
    const eventTab = screen.getByText('EVENT');
    fireEvent.click(eventTab);
    expect(mockContextProps.setActiveTab).toHaveBeenCalledWith('Event');
  });

  it('diplays navigation back button when activeWalk is present', () => {
      (useDashboardContext as jest.Mock).mockReturnValue({
          ...mockContextProps,
          activeWalk: { id: 1, name: 'Test Walk', stopIds: [] },
          activeTab: 'Walk'
      });
      render(<DashboardSidebar filteredItems={[]} />);
      expect(screen.getByText('BACK')).toBeInTheDocument();
  });
});
