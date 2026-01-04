<script setup>
  import { ref, onMounted } from "vue"

  /* =======================
  SERVICES (sample data)
  ======================= */
  const services = ref([
    {
      _id: 1,
      name: "Facial Treatment",
      description: "Relaxing facial to rejuvenate your skin",
      price: 1500
    },
    {
      _id: 2,
      name: "Hair Spa",
      description: "Deep conditioning and scalp care",
      price: 1200
    },
    {
      _id: 3,
      name: "Manicure & Pedicure",
      description: "Complete hand and foot care",
      price: 800
    }
  ])

  /* =======================
  TESTIMONIALS
  ======================= */
  const testimonials = ref([
    {
      id: 1,
      name: "Maria S.",
      message:
        "Four Maidens made me feel relaxed and confident. The staff are amazing!"
    },
    {
      id: 2,
      name: "Angela R.",
      message:
        "Very clean, professional, and soothing atmosphere. Highly recommended."
    },
    {
      id: 3,
      name: "Joy L.",
      message:
        "Best beauty haven in town! I always leave feeling refreshed."
    }
  ])

  /* =======================
  ANIMATION STATE
  ======================= */
  const visibleServices = ref([])
  const visibleTestimonials = ref([])

  /* =======================
  INTERSECTION OBSERVER
  ======================= */
  const observeElements = (selector, visibleArray) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index)
            visibleArray.value[index] = true
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    document
      .querySelectorAll(selector)
      .forEach(el => observer.observe(el))
  }

  onMounted(() => {
    observeElements(".service-card", visibleServices)
    observeElements(".testimonial-card", visibleTestimonials)
  })
</script>


<template>
  <div class="home">

    <!-- HERO -->
    <section class="hero d-flex align-items-center justify-content-center">
      <div class="text-center text-white">
        <h1 class="fw-bold">Four Maidens Beauty Haven</h1>
        <p class="lead mt-3">
          Where beauty, care, and confidence begin
        </p>
        <a href="#services" class="btn btn-outline-light mt-4">
          Explore Our Services
        </a>
      </div>
    </section>

    <!-- SERVICES -->
    <section id="services" class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold">Our Services</h2>
        <p class="text-muted">
          Carefully crafted treatments just for you
        </p>
      </div>

      <div class="row g-4">
        <div
          class="col-md-4"
          v-for="(service, index) in services"
          :key="service._id"
        >
          <div
            class="card h-100 service-card"
            :class="{ show: visibleServices[index] }"
            :data-index="index"
            :style="{ transitionDelay: `${index * 120}ms` }"
          >
            <div class="card-body text-center">
              <h5 class="card-title">{{ service.name }}</h5>
              <p class="card-text text-muted">
                {{ service.description }}
              </p>
              <p class="fw-semibold text-plum">
                Starting at ₱{{ service.price }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold">What Our Clients Say</h2>
        <p class="text-muted">
          Real experiences from our valued clients
        </p>
      </div>

      <div class="row g-4">
        <div
          class="col-md-4"
          v-for="(t, index) in testimonials"
          :key="t.id"
        >
          <div
            class="card testimonial-card h-100"
            :class="{ show: visibleTestimonials[index] }"
            :data-index="index"
            :style="{ transitionDelay: `${index * 120}ms` }"
          >
            <div class="card-body text-center">
              <p class="fst-italic text-muted">
                “{{ t.message }}”
              </p>
              <h6 class="fw-semibold mt-3 text-plum">
                — {{ t.name }}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="contact-section py-5">
      <div class="container">
        <div class="row align-items-center">

          <div class="col-md-6 mb-4 mb-md-0">
            <h2 class="fw-bold">Get in Touch</h2>
            <p class="text-muted">
              Book your appointment or visit us today
            </p>

            <ul class="list-unstyled mt-4">
              <li class="mb-2">📍 Davao City, Philippines</li>
              <li class="mb-2">📞 +63 9XX XXX XXXX</li>
              <li class="mb-2">✉️ fourmaidens@email.com</li>
            </ul>
          </div>

          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="fw-bold mb-3">Send us a message</h5>

                <input
                  type="text"
                  class="form-control mb-3"
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  class="form-control mb-3"
                  placeholder="Your Email"
                />
                <textarea
                  rows="4"
                  class="form-control mb-3"
                  placeholder="Your Message"
                />
                <button class="btn btn-plum w-100">
                  Send Message
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>


<style scoped>
  /* =======================
  HERO SECTION
  ======================= */
  .hero {
    height: 90vh;
    background: linear-gradient(
        rgba(0, 0, 0, 0.45),
        rgba(0, 0, 0, 0.45)
      ),
      url("https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3")
        center / cover no-repeat;
  }

  /* =======================
  THEME
  ======================= */
  .text-plum {
    color: #7b2d4b;
  }

  .btn-plum {
    background-color: #7b2d4b;
    color: #fff;
    border: none;
  }

  .btn-plum:hover {
    background-color: #64233d;
  }

  /* =======================
  SERVICE CARD ANIMATION
  ======================= */
  .service-card {
    border: none;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .service-card.show {
    opacity: 1;
    transform: translateY(0);
  }

  .service-card:hover {
    transform: translateY(-6px);
  }

  /* =======================
  TESTIMONIAL ANIMATION
  ======================= */
  .testimonial-card {
    border: none;
    background-color: #fff;
    opacity: 0;
    transform: translateY(25px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  .testimonial-card.show {
    opacity: 1;
    transform: translateY(0);
  }

  .testimonial-card:hover {
    transform: translateY(-4px);
  }

  /* =======================
  CONTACT
  ======================= */
  .contact-section {
    background-color: #fdf6f8;
  }

  /* =======================
  ACCESSIBILITY
  ======================= */
  @media (prefers-reduced-motion: reduce) {
    .service-card,
    .testimonial-card {
      transition: none;
      transform: none;
      opacity: 1;
    }
  }


</style>