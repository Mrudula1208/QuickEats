using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;

namespace QuickEats.API.Data
{
    public static class DemoDataPolisher
    {
        public static async Task PolishDemoDataAsync(AppDbContext context)
        {
            try
            {
                // 1. Ensure Distinct Realistic Owners Exist
                var owner1 = await context.Users.FirstOrDefaultAsync(u => u.Email == "owner@gmail.com");
                var owner2 = await context.Users.FirstOrDefaultAsync(u => u.Email == "sneha.owner@gmail.com");
                var owner3 = await context.Users.FirstOrDefaultAsync(u => u.Email == "rajesh.owner@gmail.com");
                var owner4 = await context.Users.FirstOrDefaultAsync(u => u.Email == "pooja.owner@gmail.com");

                if (owner1 == null)
                {
                    owner1 = new User
                    {
                        Name = "Amit Joshi",
                        Email = "owner@gmail.com",
                        PhoneNumber = "9820114477",
                        Role = "Owner",
                        PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash("Owner@123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(owner1);
                }
                else
                {
                    owner1.Name = "Amit Joshi";
                    owner1.PhoneNumber = "9820114477";
                    owner1.Role = "Owner";
                }

                if (owner2 == null)
                {
                    owner2 = new User
                    {
                        Name = "Sneha Deshmukh",
                        Email = "sneha.owner@gmail.com",
                        PhoneNumber = "9819225588",
                        Role = "Owner",
                        PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash("Owner@123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(owner2);
                }
                else
                {
                    owner2.Name = "Sneha Deshmukh";
                    owner2.PhoneNumber = "9819225588";
                    owner2.Role = "Owner";
                }

                if (owner3 == null)
                {
                    owner3 = new User
                    {
                        Name = "Rajesh Kulkarni",
                        Email = "rajesh.owner@gmail.com",
                        PhoneNumber = "9821336699",
                        Role = "Owner",
                        PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash("Owner@123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(owner3);
                }
                else
                {
                    owner3.Name = "Rajesh Kulkarni";
                    owner3.PhoneNumber = "9821336699";
                    owner3.Role = "Owner";
                }

                if (owner4 == null)
                {
                    owner4 = new User
                    {
                        Name = "Pooja Shetty",
                        Email = "pooja.owner@gmail.com",
                        PhoneNumber = "9833447700",
                        Role = "Owner",
                        PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash("Owner@123"),
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(owner4);
                }
                else
                {
                    owner4.Name = "Pooja Shetty";
                    owner4.PhoneNumber = "9833447700";
                    owner4.Role = "Owner";
                }

                await context.SaveChangesAsync();

                int idOwner1 = owner1.Id;
                int idOwner2 = owner2.Id;
                int idOwner3 = owner3.Id;
                int idOwner4 = owner4.Id;

                // 2. Polish All Restaurants with realistic Mumbai identities and STRICT OWNER ISOLATION
                var restaurants = await context.Restaurants.ToListAsync();
                foreach (var r in restaurants)
                {
                    switch (r.Id)
                    {
                        case 1:
                            r.Name = "Spice Route Kitchen";
                            r.Description = "Authentic North Indian curries, tandoori specialties, dal makhani & aromatic biryanis";
                            r.Address = "12 Linking Road, Bandra West, Mumbai 400050";
                            r.OpeningTime = "09:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-26401122";
                            r.IsActive = true;
                            r.IsFeatured = true;
                            r.OwnerId = idOwner1; // Amit Joshi
                            break;

                        case 3:
                            r.Name = "Urban Tadka";
                            r.Description = "Rich Punjabi gravies, paneer butter masala, garlic naans & tandoori platters";
                            r.Address = "Flat 402, Sea Green Apt, Juhu Tara Road, Juhu, Mumbai 400049";
                            r.OpeningTime = "10:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-26183344";
                            r.IsActive = true;
                            r.IsFeatured = true;
                            r.OwnerId = idOwner2; // Sneha Deshmukh
                            break;

                        case 4:
                            r.Name = "Bombay Bowl";
                            r.Description = "Signature Mumbai rice bowls, slow-cooked dum biryani & flavorful roll platters";
                            r.Address = "84 Colaba Causeway, Near Regal Cinema, Colaba, Mumbai 400005";
                            r.OpeningTime = "11:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-22045566";
                            r.IsActive = true;
                            r.OwnerId = idOwner3; // Rajesh Kulkarni
                            break;

                        case 5:
                            r.Name = "The Curry Table";
                            r.Description = "Traditional slow-cooked curries, royal vegetarian thalis & authentic desserts";
                            r.Address = "501 Hiranandani Gardens, Powai, Mumbai 400076";
                            r.OpeningTime = "11:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-25707788";
                            r.IsActive = true;
                            r.OwnerId = idOwner4; // Pooja Shetty
                            break;

                        case 10:
                            r.Name = "Green Leaf Bistro";
                            r.Description = "Healthy organic bowls, farm-fresh gourmet salads, artisanal thin-crust pizzas & cold-pressed juices";
                            r.Address = "103 Lokhandwala Complex, Andheri West, Mumbai 400053";
                            r.OpeningTime = "08:30";
                            r.ClosingTime = "22:00";
                            r.PhoneNumber = "022-26319900";
                            r.IsActive = true;
                            r.OwnerId = idOwner2; // Sneha Deshmukh
                            break;

                        case 11:
                            r.Name = "Mumbai Grill House";
                            r.Description = "Smoky kebabs, sizzlers, barbecue platters & gourmet charcoal-grilled specials";
                            r.Address = "22 Carter Road, Bandra West, Mumbai 400050";
                            r.OpeningTime = "18:00";
                            r.ClosingTime = "01:00";
                            r.PhoneNumber = "022-26451133";
                            r.IsActive = true;
                            r.OwnerId = idOwner3; // Rajesh Kulkarni
                            break;

                        case 12:
                            r.Name = "Coastal Bay Seafood";
                            r.Description = "Fresh coastal fish curries, prawn ghee roast, neer dosa & authentic Mangalorean delicacies";
                            r.Address = "15 Pali Hill, Bandra West, Mumbai 400050";
                            r.OpeningTime = "19:00";
                            r.ClosingTime = "23:30";
                            r.PhoneNumber = "022-26482244";
                            r.IsActive = true;
                            r.OwnerId = idOwner4; // Pooja Shetty
                            break;

                        case 13:
                            r.Name = "Morning Chai & Chaat Co.";
                            r.Description = "Hot ginger cutting chai, fresh bun maska, crispy samosas & Mumbai street chaat";
                            r.Address = "302 Marine Drive, Nariman Point, Mumbai 400021";
                            r.OpeningTime = "06:00";
                            r.ClosingTime = "13:00";
                            r.PhoneNumber = "022-22813355";
                            r.IsActive = true;
                            r.OwnerId = idOwner1; // Amit Joshi (Second Restaurant)
                            break;

                        case 14:
                            r.Name = "The Mumbai Pasta Bar";
                            r.Description = "Wood-fired artisanal pizzas, creamy alfredo pastas & Italian desserts";
                            r.Address = "82 Hill Road, Bandra West, Mumbai 400050";
                            r.OpeningTime = "11:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-26428811";
                            r.IsActive = true;
                            r.OwnerId = idOwner2; // Sneha Deshmukh
                            break;

                        case 15:
                            r.Name = "Bombay Burger Co.";
                            r.Description = "Gourmet grilled burgers, crispy loaded fries & chilled thick shakes";
                            r.Address = "201 Inorbit Mall Road, Malad West, Mumbai 400064";
                            r.OpeningTime = "09:00";
                            r.ClosingTime = "22:00";
                            r.PhoneNumber = "022-28782299";
                            r.IsActive = true;
                            r.OwnerId = idOwner3; // Rajesh Kulkarni
                            break;

                        case 16:
                            r.Name = "Coastal Curry House";
                            r.Description = "Authentic Konkan and Malvani thalis, surmai fry & solkadhi";
                            r.Address = "44 Shivaji Park, Dadar West, Mumbai 400028";
                            r.OpeningTime = "06:00";
                            r.ClosingTime = "11:30";
                            r.PhoneNumber = "022-24451122";
                            r.IsActive = true;
                            r.OwnerId = idOwner4; // Pooja Shetty
                            break;

                        case 17:
                            r.Name = "Charcoal Mumbai Grill";
                            r.Description = "Tandoori chicken tikka, seekh kebabs & charcoal-grilled delights";
                            r.Address = "18 Versova Beach Road, Andheri West, Mumbai 400061";
                            r.OpeningTime = "19:00";
                            r.ClosingTime = "23:30";
                            r.PhoneNumber = "022-26324455";
                            r.IsActive = true;
                            r.OwnerId = idOwner3; // Rajesh Kulkarni
                            break;

                        case 19:
                            r.Name = "The Tandoor Story";
                            r.Description = "Rich Mughlai gravies, butter chicken & stuffed kulchas";
                            r.Address = "15 JVPD Scheme, Vile Parle West, Mumbai 400049";
                            r.OpeningTime = "10:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-26127788";
                            r.IsActive = true;
                            r.OwnerId = idOwner1; // Amit Joshi
                            break;

                        case 20:
                            r.Name = "Bun & Patty House";
                            r.Description = "Crispy paneer burgers, smash patties & signature dips";
                            r.Address = "58 Linking Road, Santacruz West, Mumbai 400054";
                            r.OpeningTime = "09:00";
                            r.ClosingTime = "22:00";
                            r.PhoneNumber = "022-26053344";
                            r.IsActive = true;
                            r.OwnerId = idOwner3; // Rajesh Kulkarni
                            break;

                        case 21:
                            r.Name = "Malvan Coastal Kitchen";
                            r.Description = "Traditional Malvani curries, kombdi vade & fresh coastal delicacies";
                            r.Address = "12 Ranade Road, Dadar West, Mumbai 400028";
                            r.OpeningTime = "10:00";
                            r.ClosingTime = "23:00";
                            r.PhoneNumber = "022-24316677";
                            r.IsActive = true;
                            r.OwnerId = idOwner4; // Pooja Shetty
                            break;

                        case 1022:
                            r.Name = "Gourmet Burger Craft";
                            r.Description = "Artisanal handcrafted burgers, truffle fries & craft mocktails";
                            r.Address = "90 Phoenix Palladium, Lower Parel, Mumbai 400013";
                            r.OpeningTime = "09:00";
                            r.ClosingTime = "22:00";
                            r.PhoneNumber = "022-24908899";
                            r.IsActive = true;
                            r.OwnerId = idOwner2; // Sneha Deshmukh
                            break;

                        default:
                            if (string.IsNullOrWhiteSpace(r.Address) || r.Address.Contains("Main St") || r.Address.Contains("Test") || r.Address.Contains("Oak Ave") || r.Address.Contains("Street"))
                            {
                                r.Address = "Shop 14, High Street Phoenix, Lower Parel, Mumbai 400013";
                                r.PhoneNumber = "022-24951100";
                            }
                            if (r.OwnerId == 0)
                            {
                                r.OwnerId = idOwner2;
                            }
                            break;
                    }
                }

                // 3. Polish All Users (Customers, Owners, Delivery Partners)
                var users = await context.Users.ToListAsync();
                var customerList = new[]
                {
                    ("Mrudula More", "9820112233", "Flat 402, Sea Green Apt, Juhu Tara Road, Mumbai", "400049"),
                    ("Neha Patil", "9819223344", "12 Linking Road, Bandra West, Mumbai", "400050"),
                    ("Riya Shah", "9821334455", "84 Colaba Causeway, Near Regal Cinema, Mumbai", "400005"),
                    ("Aditya Kulkarni", "9833445566", "501 Hiranandani Gardens, Powai, Mumbai", "400076"),
                    ("Aarav Sharma", "9820556677", "103 Lokhandwala Complex, Andheri West, Mumbai", "400053"),
                    ("Priya Mehta", "9819667788", "22 Carter Road, Bandra West, Mumbai", "400050"),
                    ("Rohan Patil", "9821778899", "15 Pali Hill, Bandra West, Mumbai", "400050"),
                    ("Ananya Kulkarni", "9833889900", "302 Marine Drive, Nariman Point, Mumbai", "400021"),
                    ("Kabir Joshi", "9820990011", "44 Shivaji Park, Dadar West, Mumbai", "400028"),
                    ("Sneha Iyer", "9819113355", "82 Hill Road, Bandra West, Mumbai", "400050"),
                    ("Vikram Malhotra", "9821446688", "201 Inorbit Mall Road, Malad West, Mumbai", "400064")
                };

                var partnerList = new[]
                {
                    ("Rohit Pawar", "9820558811"),
                    ("Akash Shinde", "9819669922"),
                    ("Sandeep Jadhav", "9821770033"),
                    ("Vikas Gaikwad", "9833881144"),
                    ("Suraj More", "9820992255")
                };

                int cIdx = 0, pIdx = 0;
                foreach (var u in users)
                {
                    var role = (u.Role ?? "").ToLower();
                    if (role == "customer")
                    {
                        if (u.Name.Contains("John") || u.Name.Contains("Alex") || u.Name.Contains("Test") || u.Name.Contains("Demo") || u.Name.Contains("User") || u.Name.Contains("David") || u.Name.Contains("Michael") || u.Name.Length < 3)
                        {
                            var data = customerList[cIdx % customerList.Length];
                            u.Name = data.Item1;
                            u.PhoneNumber = data.Item2;
                            cIdx++;
                        }
                    }
                    else if (role.Contains("delivery") || role.Contains("partner") || role.Contains("rider"))
                    {
                        if (u.Name.Contains("Delivery") || u.Name.Contains("Partner") || u.Name.Contains("Test") || u.Name.Contains("Demo") || u.Name.Contains("John") || u.Name.Contains("Alex") || u.Name.Contains("Rider"))
                        {
                            var data = partnerList[pIdx % partnerList.Length];
                            u.Name = data.Item1;
                            u.PhoneNumber = data.Item2;
                            pIdx++;
                        }
                    }
                }

                // 4. Polish Saved Addresses
                var savedAddresses = await context.SavedAddresses.ToListAsync();
                int sIdx = 0;
                foreach (var sa in savedAddresses)
                {
                    if (string.IsNullOrWhiteSpace(sa.CustomerName) || sa.CustomerName.Contains("John") || sa.CustomerName.Contains("Test"))
                    {
                        var data = customerList[sIdx % customerList.Length];
                        sa.CustomerName = data.Item1;
                        sa.PhoneNumber = data.Item2;
                        sa.Area = data.Item3;
                        sa.City = "Mumbai";
                        sa.State = "Maharashtra";
                        sa.Pincode = data.Item4;
                        sIdx++;
                    }
                }

                // 5. Polish Orders (Addresses, Phone Numbers)
                var orders = await context.Orders.ToListAsync();
                int addrIdx = 0;
                foreach (var o in orders)
                {
                    if (string.IsNullOrWhiteSpace(o.DeliveryAddress) || o.DeliveryAddress.Contains("Test") || o.DeliveryAddress.Contains("123") || o.DeliveryAddress.Contains("Main St"))
                    {
                        var addrData = customerList[addrIdx % customerList.Length];
                        o.DeliveryAddress = $"{addrData.Item3}, {addrData.Item4}";
                        o.PhoneNumber = addrData.Item2;
                        addrIdx++;
                    }
                }

                // 6. Polish Reviews
                var reviews = await context.Reviews.ToListAsync();
                var sampleComments = new[]
                {
                    "The food arrived piping hot! Butter chicken was rich, creamy, and garlic naan was super fresh.",
                    "Paneer tikka was extremely tender and full of flavor. Delivery was right on time in 25 minutes.",
                    "Generous portion sizes and great packaging. The biryani aroma filled the entire room.",
                    "Good food quality overall. Loved the aromatic spices and crispy tandoori rotis.",
                    "Tasty meals, authentic flavor, and very hygienic packaging. Will definitely be ordering again!",
                    "Crispy samosas and ginger chai were phenomenal. Perfect evening snack!",
                    "Fresh ingredients, perfectly balanced flavors, and fast doorstep delivery."
                };

                int revIdx = 0;
                foreach (var rev in reviews)
                {
                    if (string.IsNullOrWhiteSpace(rev.Comment) || rev.Comment.Contains("Test") || rev.Comment.Contains("Lorem") || rev.Comment.Length < 10)
                    {
                        rev.Comment = sampleComments[revIdx % sampleComments.Length];
                        revIdx++;
                    }
                }

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Demo data polish exception: {ex.Message}");
            }
        }
    }
}
