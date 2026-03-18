import requests
import sys
import json
import tempfile
import os
from datetime import datetime
from io import BytesIO
from PIL import Image

class VehicleParkingAPITester:
    def __init__(self, base_url="https://parkwise-7.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.vehicle_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
            
        if headers:
            test_headers.update(headers)
            
        # Remove Content-Type for file uploads
        if files:
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=test_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_image(self, filename="test_image.jpg"):
        """Create a test image file"""
        img = Image.new('RGB', (100, 100), color='red')
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        img.save(temp_file.name, 'JPEG')
        return temp_file.name

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "phone": f"555-{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            print(f"   Registered user: {self.user_data['email']}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing user"""
        if not self.user_data:
            print("❌ No user data available for login test")
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Logged in user: {response['user']['email']}")
            return True
        return False

    def test_vehicle_registration(self):
        """Test vehicle registration with file uploads"""
        if not self.token:
            print("❌ No authentication token available")
            return False

        # Create test images
        vehicle_image_path = self.create_test_image("vehicle.jpg")
        ownership_proof_path = self.create_test_image("ownership.jpg")
        
        try:
            timestamp = datetime.now().strftime('%H%M%S')
            vehicle_data = {
                'make': 'Toyota',
                'model': 'Camry',
                'license_plate': f'TEST-{timestamp}',
                'color': 'White'
            }
            
            files = {
                'vehicle_image': ('vehicle.jpg', open(vehicle_image_path, 'rb'), 'image/jpeg'),
                'ownership_proof': ('ownership.jpg', open(ownership_proof_path, 'rb'), 'image/jpeg')
            }
            
            success, response = self.run_test(
                "Vehicle Registration",
                "POST",
                "api/vehicles/register",
                200,
                data=vehicle_data,
                files=files
            )
            
            if success and 'vehicle_id' in response:
                self.vehicle_id = response['vehicle_id']
                print(f"   Registered vehicle ID: {self.vehicle_id}")
                return True
            return False
            
        finally:
            # Clean up temp files
            try:
                os.unlink(vehicle_image_path)
                os.unlink(ownership_proof_path)
            except:
                pass

    def test_get_my_vehicles(self):
        """Test getting user's vehicles"""
        if not self.token:
            print("❌ No authentication token available")
            return False
            
        success, response = self.run_test(
            "Get My Vehicles",
            "GET",
            "api/vehicles/my",
            200
        )
        
        if success:
            print(f"   Found {len(response)} vehicles")
            return True
        return False

    def test_get_vehicle_details(self):
        """Test getting vehicle details by ID"""
        if not self.vehicle_id:
            print("❌ No vehicle ID available")
            return False
            
        success, response = self.run_test(
            "Get Vehicle Details",
            "GET",
            f"api/vehicles/{self.vehicle_id}",
            200
        )
        
        if success:
            print(f"   Vehicle: {response.get('make')} {response.get('model')}")
            return True
        return False

    def test_submit_complaint(self):
        """Test submitting a parking complaint"""
        if not self.token or not self.vehicle_id:
            print("❌ Missing authentication token or vehicle ID")
            return False

        # Create test complaint image
        complaint_image_path = self.create_test_image("complaint.jpg")
        
        try:
            complaint_data = {
                'vehicle_id': self.vehicle_id,
                'description': 'Vehicle parked in disabled spot without permit',
                'location': 'Main Street Parking Lot'
            }
            
            files = {
                'complaint_images': ('complaint.jpg', open(complaint_image_path, 'rb'), 'image/jpeg')
            }
            
            success, response = self.run_test(
                "Submit Complaint",
                "POST",
                "api/complaints/submit",
                200,
                data=complaint_data,
                files=files
            )
            
            if success and 'complaint_id' in response:
                print(f"   Complaint ID: {response['complaint_id']}")
                if 'ai_analysis' in response:
                    print(f"   AI Analysis: {response['ai_analysis']}")
                return True
            return False
            
        finally:
            # Clean up temp file
            try:
                os.unlink(complaint_image_path)
            except:
                pass

    def test_get_my_complaints(self):
        """Test getting user's complaints"""
        if not self.token:
            print("❌ No authentication token available")
            return False
            
        success, response = self.run_test(
            "Get My Complaints",
            "GET",
            "api/complaints/my",
            200
        )
        
        if success:
            print(f"   Found {len(response)} complaints")
            return True
        return False

    def test_send_message(self):
        """Test sending a message"""
        if not self.token or not self.user_data:
            print("❌ Missing authentication token or user data")
            return False
            
        message_data = {
            'recipient_id': self.user_data['user_id'],  # Send to self for testing
            'content': 'Test message from API test'
        }
        
        success, response = self.run_test(
            "Send Message",
            "POST",
            "api/messages/send",
            200,
            data=message_data
        )
        
        if success and 'message_id' in response:
            print(f"   Message ID: {response['message_id']}")
            return True
        return False

    def test_get_conversations(self):
        """Test getting conversations"""
        if not self.token:
            print("❌ No authentication token available")
            return False
            
        success, response = self.run_test(
            "Get Conversations",
            "GET",
            "api/messages/conversations",
            200
        )
        
        if success:
            print(f"   Found {len(response)} conversations")
            return True
        return False

def main():
    print("🚀 Starting Vehicle Parking Complaint API Tests")
    print("=" * 60)
    
    tester = VehicleParkingAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_user_registration),
        ("User Login", tester.test_user_login),
        ("Vehicle Registration", tester.test_vehicle_registration),
        ("Get My Vehicles", tester.test_get_my_vehicles),
        ("Get Vehicle Details", tester.test_get_vehicle_details),
        ("Submit Complaint", tester.test_submit_complaint),
        ("Get My Complaints", tester.test_get_my_complaints),
        ("Send Message", tester.test_send_message),
        ("Get Conversations", tester.test_get_conversations)
    ]
    
    print(f"\n📋 Running {len(tests)} test scenarios...")
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        failed_tests = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed_tests} tests failed. Backend needs attention.")
        return 1

if __name__ == "__main__":
    sys.exit(main())