'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('users', [{
      user_name: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('nconnect', [{
      imageurl: 'https://example.com/image.png',
      meeting_type: 'workshop',
      start_date: new Date('2026-07-01'),
      end_date: new Date('2026-07-02'),
      start_time: '10:00:00',
      end_time: '16:00:00',
      address: '123 Tech Park, City',
      participants: 50,
      title: 'NextJS Masterclass',
      description: 'Learn Next.js App Router and Server Actions',
      link: 'https://example.com/register',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Blog', [{
      blog_image: 'https://example.com/blog.png',
      blog_type: 'technology',
      blog_title: 'Getting started with NextJS and Neon DB',
      blog_description: 'A comprehensive guide to setting up your first NextJS app with Neon DB.',
      blog_link: 'https://example.com/blog/nextjs-neon',
      is_highlight: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('success_stories', [{
      student_name: 'Jane Doe',
      student_image: 'https://example.com/jane.png',
      student_type: 'Alumni',
      placed_company: 'Google',
      feedback: 'The workshop was incredibly helpful and landed me a job!',
      student_package: '30 LPA',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('gallery', [{
      image_url: 'https://example.com/gallery1.png',
      image_title: 'Workshop 2026',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('nconnect', null, {});
    await queryInterface.bulkDelete('Blog', null, {});
    await queryInterface.bulkDelete('success_stories', null, {});
    await queryInterface.bulkDelete('gallery', null, {});
  }
};
