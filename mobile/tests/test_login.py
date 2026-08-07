from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
import time

# 1. Khai báo cấu hình (giống hệt những gì bạn điền trong Inspector)
options = UiAutomator2Options()
options.platform_name = 'Android'
options.automation_name = 'UiAutomator2'
options.udid = 'R5CW118HNTA' # ID máy của bạn
# Nhớ dùng chữ 'r' đằng trước chuỗi đường dẫn trên Windows để tránh lỗi dấu gạch chéo
options.app = r'C:\Users\Acer\Documents\GitHub\Med_superApp_frontend\mobile\build\app\outputs\flutter-apk\app-debug.apk'

print("Đang kết nối tới điện thoại và mở app...")
# 2. Kết nối tới Appium Server (đảm bảo Terminal chạy chữ 'appium' vẫn đang bật)
driver = webdriver.Remote('http://127.0.0.1:4723', options=options)

try:
    # Đợi 5 giây cho app load xong giao diện
    time.sleep(5)
    print("Bắt đầu thực hiện thao tác...")

    # 3. TÌM VÀ NHẬP SỐ ĐIỆN THOẠI
    # (Thay chuỗi xpath bên dưới bằng xpath thực tế bạn lấy từ Inspector)
    phone_input = driver.find_element(by=AppiumBy.XPATH, value='//android.widget.EditText')
    phone_input.click() # Bấm vào ô text
    phone_input.send_keys("0869465858") # Nhập số
    print("- Đã nhập số điện thoại")
    
    time.sleep(2) # Dừng 2 giây để bạn nhìn cho rõ

    # 4. TÌM VÀ BẤM NÚT LOGIN
    login_btn = driver.find_element(by=AppiumBy.XPATH, value='//android.widget.Button[@content-desc="Login"]')
    login_btn.click()
    print("- Đã bấm nút Đăng nhập, đang chờ phản hồi...")
    
    # 5. KIỂM TRA KẾT QUẢ ĐĂNG NHẬP (ASSERTION)
    try:
        # Chờ tối đa 10 giây cho đến khi phần tử đặc trưng của màn hình tiếp theo xuất hiện
        # (Ở đây mình giả sử màn hình sau có chữ "Dashboard")
        dashboard_title = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, '//android.widget.TextView[@text="Dashboard"]'))
        )
        
        # Nếu tìm thấy, xác nhận (assert) nó đang hiển thị trên màn hình
        assert dashboard_title.is_displayed(), "Chữ Dashboard không hiển thị!"
        print("✅ TEST THÀNH CÔNG: App đã chuyển sang màn hình tiếp theo!")

    except Exception:
        # Nếu sau 10 giây vẫn không tìm thấy chữ "Dashboard", nó sẽ rơi vào đây
        print("❌ TEST THẤT BẠI: Đăng nhập lỗi hoặc app chưa chuyển màn hình!")
        # Trong hệ thống test thật, ta dùng lệnh 'raise' để đánh dấu Fail cho ca test này
        raise
except Exception as e:
    print(f"Có lỗi xảy ra: {e}")

finally:
    # 5. Đóng app và kết thúc phiên làm việc
    driver.quit()
    print("Đã đóng ứng dụng.")