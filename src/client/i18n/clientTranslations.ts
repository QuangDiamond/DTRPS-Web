export type ClientLanguage = 'vi' | 'en';

/**
 * Từ điển dịch chính xác UI khu Du khách Web (Tiếng Việt → English).
 * Admin và Đối tác không dùng bộ này. Dữ liệu từ DB/API giữ nguyên.
 */
const EXACT_VI_TO_EN: Record<string, string> = {
  // Điều hướng & Chung
  'Trang chủ': 'Home',
  'Khám phá': 'Explore',
  'Chuyến đi': 'Trips',
  'Yêu thích': 'Favorites',
  'Hồ sơ': 'Profile',
  'Tài khoản': 'Account',
  'Hồ sơ của tôi': 'My profile',
  'Đăng nhập': 'Sign in',
  'Đăng ký': 'Sign up',
  'Đăng xuất': 'Sign out',
  'Thông báo': 'Notifications',
  'Cài đặt': 'Settings',
  'Cài đặt ứng dụng': 'App settings',
  'Chỉnh sửa hồ sơ': 'Edit profile',
  'Chỉnh sửa': 'Edit',
  'Sở thích du lịch': 'Travel preferences',
  'Đổi mật khẩu': 'Change password',
  'Quay lại': 'Back',
  Đóng: 'Close',
  Hủy: 'Cancel',
  'Hủy bỏ': 'Cancel',
  'Hủy thay đổi': 'Cancel changes',
  Lưu: 'Save',
  'Lưu thay đổi': 'Save changes',
  'Xác nhận': 'Confirm',
  Xóa: 'Delete',
  'Xóa tất cả': 'Clear all',
  'Thử lại': 'Retry',
  'Thử tải lại': 'Try reloading',
  'Xem tất cả': 'See all',
  'Xem chi tiết': 'View details',
  'Sao chép': 'Copy',
  'Chia sẻ': 'Share',
  'Đang tải…': 'Loading…',
  'Đang tải...': 'Loading...',
  'Đang tải thêm…': 'Loading more…',
  'Đang mở…': 'Opening…',

  // Trang chủ
  'Việt Nam theo cách': 'Vietnam, your own',
  'của riêng bạn': 'way',
  'Tìm địa điểm, nhận gợi ý cá nhân hóa và để SmartTravel sắp xếp lịch trình theo sở thích, ngân sách của bạn.':
    'Discover places, get personalized AI suggestions, and let SmartTravel organize your itinerary by your interests and budget.',
  'Lập kế hoạch với AI': 'Plan with AI',
  'Lập kế hoạch chuyến đi': 'Plan a trip',
  'Khám phá địa điểm': 'Explore places',
  'Được tài trợ': 'Sponsored',
  'Đối tác đã xác minh': 'Verified partner',
  'Mới trên SmartTravel': 'New on SmartTravel',
  'Khám phá ngay': 'Explore now',
  'CHUYẾN ĐI SẮP TỚI': 'UPCOMING TRIP',
  'Chuyến đi sắp tới': 'Upcoming trip',
  'ĐANG DIỄN RA': 'IN PROGRESS',
  'Đang tải chuyến đi': 'Loading trips',
  'Xem chuyến đi': 'View trip',
  Còn: 'In',
  'ngày nữa': 'days',
  'Hoàn thiện sở thích du lịch': 'Complete travel preferences',
  'Càng hiểu bạn, gợi ý càng sát: chế độ ăn, người đi cùng, nhu cầu đặc biệt…':
    'The more we know you, the better our suggestions: diet, companions, special needs…',
  'Thiết lập sở thích': 'Set preferences',
  'Vừa cập nhật': 'Just updated',
  'VỪA CẬP NHẬT': 'JUST UPDATED',
  'Mới có trên SmartTravel': 'New on SmartTravel',
  'Cách hoạt động': 'How it works',
  'Lịch trình hoàn chỉnh chỉ với 3 bước': 'A complete itinerary in 3 steps',
  '3 bước để có lịch trình hoàn chỉnh': '3 steps to a complete itinerary',
  'Cho chúng tôi biết bạn thích gì': 'Tell us what you like',
  'Chọn điểm đến, ngân sách, người đi cùng và kiểu trải nghiệm bạn mong muốn.':
    'Choose destination, budget, companions, and your preferred travel style.',
  'AI gợi ý kèm % phù hợp': 'AI picks with match %',
  'Mỗi địa điểm có độ phù hợp và lý do được gợi ý, bạn tự do thêm hay bỏ.':
    'Each place includes a match score and reason — freely add or remove.',
  'Lịch trình tự chia theo ngày': 'Auto day-by-day schedule',
  'Hệ thống sắp xếp thứ tự, giờ giấc và cảnh báo nếu một ngày quá dày.':
    'Automatically arranges order, timing, and warns if a day is too packed.',
  'Bắt đầu ngay': 'Get started',
  'Dành cho doanh nghiệp': 'For businesses',
  'Đưa địa điểm của bạn đến hàng nghìn du khách': 'Bring your venue to thousands of travellers',
  'Đăng ký đối tác, được xác minh và xuất hiện ở khu nổi bật trên trang chủ cùng gợi ý chuyến đi.':
    'Register as a partner, get verified, and appear in featured home spots and trip recommendations.',
  'Trở thành đối tác': 'Become a partner',
  'địa điểm': 'places',
  'tỉnh thành': 'provinces',
  'gợi ý': 'suggestions',
  'Tìm địa điểm, ví dụ: Chùa Hương, Hồ Tây…': 'Search places, e.g. West Lake…',
  'Tìm địa điểm, ví dụ: Chùa Hương, Hồ Tây...': 'Search places, e.g. West Lake...',
  'gợi ý theo sở thích': 'personalized picks',
  // 34 tỉnh/thành Việt Nam (bản thường & chữ hoa)
  'Hà Nội': 'Ha Noi',
  Huế: 'Hue',
  'Hải Phòng': 'Hai Phong',
  'Đà Nẵng': 'Da Nang',
  'TP. Hồ Chí Minh': 'Ho Chi Minh City',
  'Cần Thơ': 'Can Tho',
  'Lai Châu': 'Lai Chau',
  'Điện Biên': 'Dien Bien',
  'Sơn La': 'Son La',
  'Lạng Sơn': 'Lang Son',
  'Quảng Ninh': 'Quang Ninh',
  'Thanh Hóa': 'Thanh Hoa',
  'Nghệ An': 'Nghe An',
  'Hà Tĩnh': 'Ha Tinh',
  'Cao Bằng': 'Cao Bang',
  'Tuyên Quang': 'Tuyen Quang',
  'Lào Cai': 'Lao Cai',
  'Thái Nguyên': 'Thai Nguyen',
  'Phú Thọ': 'Phu Tho',
  'Bắc Ninh': 'Bac Ninh',
  'Hưng Yên': 'Hung Yen',
  'Ninh Bình': 'Ninh Binh',
  'Quảng Trị': 'Quang Tri',
  'Quảng Ngãi': 'Quang Ngai',
  'Gia Lai': 'Gia Lai',
  'Khánh Hòa': 'Khanh Hoa',
  'Lâm Đồng': 'Lam Dong',
  'Đắk Lắk': 'Dak Lak',
  'Đồng Nai': 'Dong Nai',
  'Tây Ninh': 'Tay Ninh',
  'Vĩnh Long': 'Vinh Long',
  'Đồng Tháp': 'Dong Thap',
  'Cà Mau': 'Ca Mau',
  'An Giang': 'An Giang',
  'Việt Nam': 'Vietnam',

  // Danh mục tham chiếu cố định từ DB (nhóm loại hình, loại hình con, sở thích, phương tiện, nhu cầu)
  'Lưu trú': 'Stays',
  'Ẩm thực': 'Food & Drink',
  'Vui chơi & Tham quan': 'Attractions',
  'Mua sắm & Đặc sản': 'Shopping & Specialties',
  'Khách sạn': 'Hotel',
  'Nhà hàng': 'Restaurant',
  'Quán cà phê': 'Cafe',
  'Quán ăn địa phương': 'Local Eatery',
  'Di tích & Di sản': 'Heritage & History',
  'Khu vui chơi': 'Amusement Park',
  'Công viên': 'Park',
  'Danh lam thắng cảnh': 'Scenic Spot',
  'Điểm check-in': 'Check-in Spot',
  'Chợ đêm': 'Night Market',
  'Cửa hàng đặc sản': 'Specialty Store',
  'Cửa hàng lưu niệm': 'Souvenir Shop',
  'Làng nghề': 'Craft Village',
  'Thiên nhiên & Ngoài trời': 'Nature & Outdoors',
  'Văn hóa & Lịch sử': 'Culture & History',
  'Chụp ảnh': 'Photography',
  'Mua sắm': 'Shopping',
  'Cuộc sống về đêm': 'Nightlife',
  Biển: 'Beach',
  'Máy bay': 'Flight',
  'Tàu hỏa': 'Train',
  'Xe khách': 'Bus',
  'Đi bộ': 'Walking',
  'Ăn chay': 'Vegetarian',
  'Phù hợp trẻ em': 'Kid-friendly',
  'Phù hợp người lớn tuổi': 'Senior-friendly',
  'Thân thiện với thú cưng': 'Pet-friendly',
  'Người khuyết tật': 'Accessible',
  'Nhóm đông người': 'Large group',
  'Hạn chế vận động mạnh': 'Low physical effort',
  'Ưu tiên không gian yên tĩnh': 'Quiet space preferred',

  // Cụm ngắn / tách node trong JSX
  'Xin chào,': 'Hello,',
  Mới: 'New',
  người: 'people',
  'sở thích': 'preferences',
  'loại hình': 'categories',
  ngày: 'days',
  'Những nơi đáng khám phá': 'Places worth exploring',
  'Tìm địa điểm theo tên, ví dụ: Chùa Hương, Hồ Tây...':
    'Search places by name, e.g. Huong Pagoda, West Lake...',
  'Tìm địa điểm du lịch, món ăn, khách sạn…': 'Search places, food, hotels…',

  // Hồ sơ & Chỉnh sửa hồ sơ & Đổi mật khẩu
  'Du khách': 'Traveller',
  'Đối tác': 'Partner',
  'Quản trị viên': 'Admin',
  'Điểm đã lưu': 'Saved places',
  'HÀNH TRÌNH & YÊU THÍCH': 'TRIPS & FAVORITES',
  'CÀI ĐẶT & TIỆN ÍCH': 'SETTINGS & UTILITIES',
  'Khám phá Việt Nam theo cách thông minh nhất ✨': 'Explore Vietnam the smartest way ✨',
  'Đổi ảnh đại diện': 'Change avatar',
  'Cập nhật thông tin cá nhân & ảnh': 'Update personal info & photo',
  'Quản lý lịch trình & vé máy bay': 'Manage itineraries & bookings',
  'Quản lý kế hoạch & lịch trình': 'Manage plans & itineraries',
  'Bộ sưu tập điểm đến & quán ăn': 'Saved places & restaurants',
  'Trải nghiệm, ngân sách, phong cách': 'Experiences, budget & style',
  'Trải nghiệm, phong cách, yêu cầu đặc biệt': 'Experiences, style & special needs',
  'Cập nhật thời tiết & gợi ý hành trình': 'Weather alerts & itinerary updates',
  'Cập nhật đánh giá, chuyến đi & hệ thống': 'Reviews, trips & system updates',
  'Bảo mật tài khoản': 'Account security',
  'Đổi mật khẩu đăng nhập': 'Update login password',
  'Ngôn ngữ, giao diện, thông báo': 'Language, notifications & support',
  'Thông báo, định vị, hỗ trợ': 'Notifications, permissions & support',
  'Khu vực đối tác': 'Partner portal',
  'Đăng ký và quản lý địa điểm kinh doanh': 'Register and manage your business venues',
  'Trang quản trị': 'Admin panel',
  'Dành cho quản trị viên': 'For administrators',
  'Trợ giúp & Hỗ trợ': 'Help & Support',
  'Tổng đài cứu hộ du lịch 24/7 & FAQ': '24/7 Travel Support Hotline & FAQ',
  'Đăng xuất khỏi thiết bị này': 'Sign out from this device',
  'Nhấn để thay đổi ảnh đại diện (lưu ngay)': 'Click to change avatar (saves immediately)',
  '(Tối đa 5MB, JPG/PNG/WEBP)': '(Max 5MB, JPG/PNG/WEBP)',
  'Gỡ ảnh đại diện': 'Remove avatar',
  'Đã xác minh': 'Verified',
  'Không thể đổi': 'Cannot be changed',
  'Sở thích du lịch yêu thích': 'Favorite travel preferences',
  'Trải nghiệm, ngân sách, phương tiện, phong cách': 'Experiences, budget, transport & style',
  'Thông tin hồ sơ giúp AI thiết kế lộ trình cá nhân hóa chính xác hơn theo phong cách của bạn.':
    'Your profile helps AI design more accurate personalized itineraries tailored to your style.',
  'Thay đổi ảnh đại diện': 'Change avatar',
  'Họ và tên': 'Full name',
  'Nhập họ và tên': 'Enter full name',
  'Địa chỉ Email': 'Email address',
  'Số điện thoại': 'Phone number',
  'Ví dụ 0912345678 hoặc +84912345678': 'e.g. 0912345678 or +84912345678',
  'Ngày sinh': 'Date of birth',
  'Đổi mật khẩu thành công!': 'Password changed successfully!',
  'Bạn vẫn đang đăng nhập trên thiết bị này. Các thiết bị khác đã được đăng xuất — hãy dùng mật khẩu mới khi đăng nhập lại.':
    'You stay signed in on this device. Other devices have been signed out — use your new password to sign in again.',
  'Về trang cá nhân': 'Back to profile',
  'Bảo vệ tài khoản của bạn': 'Protect your account',
  'Quên mật khẩu?': 'Forgot password?',
  'Độ an toàn:': 'Strength:',
  'Lưu mật khẩu mới': 'Save new password',
  'Mật khẩu hiện tại': 'Current password',
  'Nhập mật khẩu hiện tại': 'Enter current password',
  'Mật khẩu mới': 'New password',
  'Nhập mật khẩu mới': 'Enter new password',
  'Xác nhận mật khẩu mới': 'Confirm new password',
  'Nhập lại mật khẩu mới': 'Re-enter new password',
  'Tối thiểu 8 ký tự': 'At least 8 characters',
  'Có ít nhất 1 chữ in hoa (A-Z)': 'At least 1 uppercase letter (A-Z)',
  'Có ít nhất 1 chữ thường (a-z)': 'At least 1 lowercase letter (a-z)',
  'Có ít nhất 1 số (0-9)': 'At least 1 number (0-9)',
  'Khác mật khẩu hiện tại': 'Different from current password',
  'Chưa nhập': 'Not entered',
  'Yếu (Weak)': 'Weak',
  'Trung bình (Medium)': 'Medium',
  'Khá mạnh (Strong)': 'Strong',

  // Khám phá & Bộ lọc
  'Khám phá Việt Nam': 'Explore Vietnam',
  'Bạn muốn khám phá': 'Where do you want to',
  'nơi nào tiếp theo?': 'explore next?',
  'Bạn muốn đi đâu?': 'Where do you want to go?',
  'Chọn tỉnh thành bạn yêu thích và tìm những trải nghiệm đáng nhớ khắp Việt Nam.':
    'Pick your favorite province and discover memorable experiences across Vietnam.',
  'Đang tải danh sách tỉnh thành...': 'Loading provinces...',
  'Tỉnh/thành phù hợp': 'Matching provinces',
  'Gõ tên và chọn gợi ý': 'Type a name and pick a suggestion',
  'Đi khắp Việt Nam, theo cách của bạn': 'Travel across Vietnam, your way',
  'Gợi ý:': 'Suggested:',
  'CẢM HỨNG CHO CHUYẾN ĐI': 'TRIP INSPIRATION',
  'Xem mọi loại hình': 'View all categories',
  'KHÁM PHÁ ĐIỂM ĐẾN': 'EXPLORE DESTINATIONS',
  'Điều gì khiến bạn hứng thú?': 'What interests you?',
  'Tất cả địa điểm': 'All places',
  'Mặc định': 'Default',
  'Đánh giá cao': 'Top rated',
  'Phổ biến': 'Popular',
  'Bộ lọc': 'Filters',
  'Tinh chỉnh trải nghiệm': 'Refine experience',
  'Chọn loại hình và đánh giá yêu thích': 'Choose preferred categories and ratings',
  'Loại hình trải nghiệm': 'Experience categories',
  'Loại hình': 'Category',
  'Đánh giá tối thiểu': 'Minimum rating',
  'Lọc đánh giá trên các địa điểm đã tải.': 'Filters ratings across loaded places.',
  'Chưa tìm thấy điểm đến phù hợp': 'No matching places found',
  'Hãy thử chọn tỉnh/thành khác hoặc điều chỉnh bộ lọc. Những địa điểm phù hợp có thể nằm ở trang kết quả tiếp theo.':
    'Try another province or adjust filters. Matching places may appear on the next page.',
  'Khám phá tất cả': 'Explore all',
  'Sắp xếp áp dụng trên các địa điểm đã tải.': 'Sorting applies to loaded places.',
  'Nhập tên tỉnh/thành phố...': 'Enter province/city name...',
  'Nhập tỉnh/thành, ví dụ: Đà Nẵng': 'Enter province/city, e.g. Da Nang',
  'Đặt lại': 'Reset',
  'Xem kết quả': 'Show results',

  // Chi tiết địa điểm
  'Chi tiết điểm đến': 'Place details',
  'Chi Tiết Điểm Đến': 'Place Details',
  'Chi tiết địa điểm': 'Place details',
  'Đang mở cửa': 'Open now',
  'Đã đóng cửa': 'Closed',
  'Giờ mở cửa': 'Opening hours',
  'Giờ mở cửa hôm nay': "Today's opening hours",
  'Mở cả ngày, tất cả các ngày trong tuần': 'Open all day, every day',
  'Giá tham khảo': 'Reference price',
  'Bảng giá tham khảo': 'Reference price list',
  'Chưa có thông tin giá.': 'No price information yet.',
  'Giá tham khảo, có thể thay đổi theo thời điểm.': 'Reference prices, subject to change.',
  'Miễn phí': 'Free',
  'Chưa cập nhật': 'Not updated',
  'Điện thoại': 'Phone',
  'Trang web': 'Website',
  'Giới thiệu': 'About',
  'Giới thiệu điểm đến': 'About this place',
  'Thông tin thực tế': 'Practical info',
  'Thời tiết hôm nay': "Today's weather",
  'Vị trí & Đường đi': 'Location & Directions',
  'Mở Bản Đồ': 'Open Map',
  'Mở bản đồ': 'Open Map',
  'Chỉ đường': 'Directions',
  'Đánh giá địa điểm': 'Place reviews',
  'Viết đánh giá': 'Write a review',
  'Gửi đánh giá': 'Submit review',
  'Báo cáo đánh giá': 'Report review',
  'Bạn đã báo cáo đánh giá này': 'You have reported this review',
  'Không tìm thấy địa điểm': 'Place not found',
  'Đăng nhập để viết đánh giá cho địa điểm này.': 'Sign in to write a review for this place.',
  'Chưa có đánh giá nào cho địa điểm này. Hãy là người đầu tiên!':
    'No reviews yet for this place. Be the first!',
  'Ảnh trước': 'Previous photo',
  'Ảnh tiếp theo': 'Next photo',

  // Yêu thích
  'Địa điểm yêu thích': 'Favorite places',
  'Chưa có địa điểm yêu thích': 'No favorite places yet',
  'Sắp xếp:': 'Sort:',
  'Sắp xếp': 'Sort',
  'Mới lưu gần đây': 'Recently saved',
  'Tên A - Z': 'Name A - Z',
  'Sẵn sàng lên đường?': 'Ready to go?',
  'Bạn muốn kết hợp các điểm yêu thích này vào một lịch trình thông minh?':
    'Want to combine these favorite places into a smart itinerary?',
  'Tạo chuyến đi từ danh sách này': 'Create a trip from this list',
  'Bỏ yêu thích': 'Remove favorite',

  // Chuyến đi & Lập kế hoạch & Lịch trình
  'Chuyến đi của tôi': 'My trips',
  'Các kế hoạch đã lưu trong tài khoản Smart Travel': 'Saved plans in your SmartTravel account',
  'Đang tải các chuyến đi từ Backend...': 'Loading your trips...',
  'Tạo kế hoạch để bắt đầu hành trình của bạn.': 'Create a plan to start your journey.',
  'Bạn có dự định mới?': 'Have a new trip in mind?',
  'Lên kế hoạch, chọn địa điểm và để Backend sắp lịch trình.':
    'Plan your trip, pick places, and let SmartTravel build your schedule.',
  'Lên lịch mới': 'New trip',
  'Tạo chuyến đi mới': 'Create new trip',
  'Mở chuyến đi': 'Open trip',
  'Sửa kế hoạch': 'Edit plan',
  'Xóa kế hoạch': 'Delete plan',
  'Xem địa điểm đã chọn': 'View selected places',
  'Xem danh sách địa điểm': 'View suggested places',
  'Chưa hoàn tất': 'Ongoing',
  'Đã kết thúc': 'Finished',
  'Thời gian': 'Duration',
  'Số người': 'Group size',
  'Tất cả': 'All',
  'Đang diễn ra': 'In progress',
  'Sắp tới': 'Upcoming',
  'Đã hoàn thành': 'Completed',
  'Kết thúc': 'Finished',
  'Tạo lịch trình du lịch cá nhân hóa': 'Create a personalized travel itinerary',
  'Chọn điểm đến, ngân sách và sở thích để bắt đầu hành trình.':
    'Choose your destination, budget, and preferences to start your journey.',
  'Điểm đến mơ ước': 'Dream destination',
  'Chọn tỉnh/thành du lịch': 'Choose a province/city',
  'Điểm đến': 'Destination',
  'Thời gian chuyến đi': 'Trip dates',
  'Chọn ngày bắt đầu và số ngày': 'Pick start date and duration',
  'Ngày đi': 'Start date',
  'Số ngày': 'Number of days',
  'Bạn đồng hành': 'Travel companions',
  'Số lượng và kiểu nhóm du lịch': 'Group size and travel style',
  'Tùy chỉnh thành viên:': 'Custom group size:',
  'Ngân sách dự kiến': 'Estimated budget',
  'Tổng ngân sách cho cả chuyến đi': 'Total budget for the entire trip',
  'Nhập ngân sách (VND)': 'Enter budget (VND)',
  'Hoặc kéo để chọn': 'Or drag to choose',
  'Tối đa 1 tỷ': 'Up to 1B VND',
  'Cá nhân hóa chuyến đi của bạn': 'Personalize your trip',
  'Dựa trên sở thích bạn đã thiết lập — dùng cho mọi chuyến đi mới.':
    'Based on your saved preferences — applied to all new trips.',
  'Bạn chưa thiết lập sở thích cá nhân hóa. Thiết lập ngay để Smart Travel gợi ý đúng gu của bạn hơn.':
    "You haven't set your travel preferences yet. Set them now for better AI recommendations.",
  'Thiết lập ngay': 'Set up now',
  'Nhịp độ chuyến đi (Travel Pace)': 'Travel Pace',
  'AI đề xuất địa điểm; hệ thống xếp lịch sau khi bạn chọn địa điểm':
    'AI suggests places; the system schedules your itinerary after you select them',
  'Ngân sách chuyến đi': 'Trip budget',
  'Tổng chi phí dự kiến': 'Total estimated cost',
  'Ngân sách kế hoạch': 'Planned budget',
  'Chi phí dự kiến': 'Estimated cost',
  'Chưa có hoạt động': 'No activities yet',
  'Ngày này chưa được sắp xếp địa điểm.': 'No places scheduled for this day yet.',
  'Chỉnh sửa hoạt động': 'Edit activity',
  'Khung giờ tham quan': 'Visit time',
  'Giờ bắt đầu': 'Start time',
  'Giờ kết thúc': 'End time',
  'HÀNH TRÌNH CỦA BẠN': 'YOUR ITINERARY',
  'Lịch trình từng ngày': 'Day-by-day itinerary',
  'Địa điểm đã chọn': 'Selected places',
  'Các ngày trong chuyến đi': 'Trip days',
  'Đánh giá của bạn': 'Your review',
  'Về tổng quan': 'Back to overview',
  'Xem tất cả các ngày': 'View all days',
  'Các hoạt động trong ngày': 'Activities of the day',
  'Ngày tham quan đã hoàn thành': 'Day completed',
  'Ngày trước': 'Previous day',
  'Ngày tiếp theo': 'Next day',
  'Chi tiết lịch trình': 'Itinerary details',
  'Yêu cầu đặc biệt': 'Special needs',
  'Bạn có yêu cầu đặc biệt nào không? (Chọn nếu có)':
    'Do you have any special needs? (Select if applicable)',

  // Bản đồ & Dẫn đường
  'Ô tô': 'Car',
  'Xe máy': 'Motorbike',
  'Bắt đầu đi': 'Start',
  'Bắt đầu dẫn đường': 'Start navigation',
  'Thoát dẫn đường': 'Exit navigation',
  'Tuyến đường Goong': 'Goong route',
  'Tuyến nhanh nhất': 'Fastest route',
  'Tính lại đường': 'Recalculate',
  'Lấy GPS': 'Get GPS',
  'Chọn vị trí của tôi': 'Pick my location',
  'Dùng GPS thật': 'Use real GPS',
  'Đổi cây xăng': 'Change station',
  'Về tuyến chính': 'Back to main route',
  'Cây xăng gần bạn (≤ 5 km)': 'Nearby gas stations (≤ 5 km)',
  'Bỏ qua': 'Skip',
  'Hoàn thành ngày': 'Complete day',

  // Cài đặt
  'NGÔN NGỮ': 'LANGUAGE',
  'Ngôn ngữ': 'Language',
  'Chọn ngôn ngữ hiển thị cho giao diện du khách': 'Choose display language for traveller UI',
  'THÔNG BÁO & ĐỊNH VỊ': 'NOTIFICATIONS & LOCATION',
  'Thông báo đẩy': 'Push notifications',
  'Tin tức & ưu đãi khách sạn, điểm đến': 'Important updates about your trips & account',
  'Nhắc nhở lịch trình & Chuyến đi': 'Trip & itinerary reminders',
  'Thông báo trước giờ khởi hành 2 giờ': 'Remind before departure & trip review',
  'Cập nhật thời tiết điểm đến': 'Destination weather alerts',
  'Dự báo mưa bão hoặc nắng đẹp tại VN': 'Alerts when bad weather affects your itinerary',
  'Dịch vụ định vị': 'Location services',
  'Dùng khi theo dõi hành trình trên bản đồ': 'Used for live navigation on the map',
  'HỖ TRỢ & THÔNG TIN': 'SUPPORT & INFO',
  'Tổng đài hỗ trợ': 'Support hotline',
  'Email hỗ trợ': 'Support email',
  'Phiên bản ứng dụng': 'App version',
  'Đã lưu cài đặt.': 'Settings saved.',
  'Đã chuyển sang Tiếng Việt.': 'Switched to Vietnamese.',
  'Switched to English.': 'Switched to English.',

  // Thông báo
  'Đọc tất cả': 'Mark all read',
  'Chưa đọc': 'Unread',
  'Thời tiết': 'Weather',
  'Đánh giá': 'Reviews',
  Khác: 'Other',
};

export function translateClientViToEn(input: string): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  if (!normalized) return input;
  const exact = EXACT_VI_TO_EN[normalized];
  if (exact) return exact;

  let m: RegExpMatchArray | null;
  if ((m = normalized.match(/^Xin chào,\s*(.+?)\s*👋$/))) {
    return `Hello, ${m[1] === 'bạn' ? 'there' : m[1]} 👋`;
  }
  if ((m = normalized.match(/^Còn\s+(\d+)\s+ngày nữa$/))) {
    return `${m[1]} days left`;
  }
  if ((m = normalized.match(/^(\d+)\s+địa điểm từ hệ thống$/))) {
    return `${m[1]} places available`;
  }
  if ((m = normalized.match(/^\((\d+)\s+điểm đã lưu\)$/))) {
    return `(${m[1]} saved places)`;
  }
  if ((m = normalized.match(/^\((\d+)\s+đánh giá\)$/))) {
    return `(${m[1]} reviews)`;
  }
  if ((m = normalized.match(/^đến\s+(.+)$/))) {
    return `to ${m[1]}`;
  }
  if ((m = normalized.match(/^(\d+)\s+sở thích$/))) {
    return `${m[1]} preferences`;
  }
  if ((m = normalized.match(/^(\d+)\s+điểm$/))) {
    return `${m[1]} places`;
  }
  if ((m = normalized.match(/^(\d+)\s+sắp tới$/))) {
    return `${m[1]} upcoming`;
  }
  if ((m = normalized.match(/^(\d+)\s+người$/))) {
    return `${m[1]} ${Number(m[1]) === 1 ? 'person' : 'people'}`;
  }
  if ((m = normalized.match(/^(\d+)\s+loại hình$/))) {
    return `${m[1]} categories`;
  }
  if ((m = normalized.match(/^(\d+)\s+đánh giá$/))) {
    return `${m[1]} reviews`;
  }
  if ((m = normalized.match(/^(\d+)\s+chưa đọc$/))) {
    return `${m[1]} unread`;
  }
  if ((m = normalized.match(/^Địa điểm tại\s+(.+)$/))) {
    return `Places in ${m[1]}`;
  }
  if ((m = normalized.match(/^Dự báo thời tiết\s+(\d+)\s+ngày$/))) {
    return `${m[1]}-day weather forecast`;
  }
  if ((m = normalized.match(/^Tuyến\s+(\d+)$/))) {
    return `Route ${m[1]}`;
  }
  if ((m = normalized.match(/^Ngày\s+(\d+)$/))) {
    return `Day ${m[1]}`;
  }
  if ((m = normalized.match(/^(.+?)\s*·\s*(\d+)\s+ngày$/))) {
    return `${m[1]} · ${m[2]} ${Number(m[2]) === 1 ? 'day' : 'days'}`;
  }
  if ((m = normalized.match(/^\+\s*(.+)$/))) {
    const inner = EXACT_VI_TO_EN[m[1].trim()];
    if (inner) return `+ ${inner}`;
  }
  // Chuỗi ghép dạng "Khách sạn · Hà Nội" → dịch cả phần trái và phần phải (tỉnh/thành)
  if ((m = normalized.match(/^([^·]+?)\s*·\s*(.+)$/))) {
    const rawLeft = m[1].trim();
    const rawRight = m[2].trim();
    const left = EXACT_VI_TO_EN[rawLeft] ?? rawLeft;
    const right = EXACT_VI_TO_EN[rawRight] ?? rawRight;
    if (left !== rawLeft || right !== rawRight) return `${left} · ${right}`;
  }
  if ((m = normalized.match(/^(\d+)\s+phút trước$/))) {
    return `${m[1]} min ago`;
  }
  if ((m = normalized.match(/^(\d+)\s+giờ trước$/))) {
    return `${m[1]} hr ago`;
  }
  if ((m = normalized.match(/^(\d+)\s+ngày trước$/))) {
    return `${m[1]}d ago`;
  }
  if (normalized === 'Vừa xong') {
    return 'Just now';
  }
  return input;
}
