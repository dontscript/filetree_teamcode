-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 07, 2017 at 05:37 AM
-- Server version: 5.7.17-0ubuntu0.16.04.1
-- PHP Version: 7.0.15-0ubuntu0.16.04.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teamcode`
--

-- --------------------------------------------------------

--
-- Table structure for table `contributors`
--

CREATE TABLE `contributors` (
  `project_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `permission_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dockers`
--

CREATE TABLE `dockers` (
  `docker_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `port` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `project_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `docker_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `id` bigint(20) NOT NULL,
  `value` varchar(62) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tokens`
--

INSERT INTO `tokens` (`id`, `value`, `user_email`, `expires_at`) VALUES
(1, 'HlHLtSDdWFQdMu44ms1t5evfoy26x66tldwdxuP7tPQ4oqmRoYBtkAggO6fo5Q', 'locpnh1995@gmail.com', '2017-05-07 10:47:16'),
(2, 'XACL2SLSEup8qsZKI0NRrDSpr0tOG8Amlk0SBH9L9q6lISRTHZsHsfbCfIVT6b', 'locpnh1995@gmail.com', '2017-05-07 10:47:42'),
(3, '7rDQQfAJ6bh3rFGABbgcFmmvRlpilh9Kjsma1RTfpxCWcoppoIvgq8l2OgSJDf', 'locpnh1995@gmail.com', '2017-05-07 10:50:39'),
(4, 'IYSbhMKaYAbSFooFfaapb9j18556Uf3VrvK9ch0kwqdMoeBJWI3tRziHBYIQz0', 'locpnh1995@gmail.com', '2017-05-07 10:51:39'),
(5, 'Z1mTOdzS6h2sQYckIjWRBL7zPQ6ZgWZDQ4GLtDD5kmpequAemOacsmJvyGNVRv', 'locpnh1995@gmail.com', '2017-05-07 10:52:21'),
(6, '59JqNYMXJ1DpgI7swW1b3S1GrZQMyvaWT4629Uw6l7kZFO0cDKAfLZwdfkAjaf', 'locpnh1995@gmail.com', '2017-05-07 10:52:47'),
(7, 'sgERXgXGooDV2I94nVgbATjOaM3zlopLK859CNzWbXlfQvkOzWvnj6v9X1HdLs', 'locpnh1995@gmail.com', '2017-05-07 10:54:05'),
(8, 'Crtq5Tmw1rCX9W6ULnxA7osLGdyV9seR0wjgrSMxFDPbrOb5vI1I1rLjuqHnqh', 'locpnh1995@gmail.com', '2017-05-07 11:08:29'),
(9, 'UPDWXGav06s9IhBx3bbnIvdW0jYSkAYPdQ2RaUeVbHQc8fvZYgMiSgoeTVmAaK', 'locpnh1995@gmail.com', '2017-05-07 11:09:07'),
(10, 'iaCPSKOVFKjyeEsLwp6KNHdYWr0ISxPpJHjYaPAulY70hVResdFGWxHDojOsel', 'locpnh1995@gmail.com', '2017-05-07 11:20:24'),
(11, 'mBBvTGdHFEnYtrjeJVSPowY7KgIaKepFCCbRD6fk2t07TZ1WBKbHURxv5IMSra', 'locpnh1995@gmail.com', '2017-05-07 11:21:21'),
(12, 'AAQAlNFYqzRA2nJbDDgwrOBZAlDIi7iQYhRgtXI6wkx2kuPrYXwAIdz5EQoEaC', 'locpnh1995@gmail.com', '2017-05-07 11:22:42'),
(14, 'yiK2wS0JdKzSKQ3KLEruo0QP9VYzFyS7LFUnhaJVYq0i0Vz2VFdTpCXzzroESh', 'locpnh1995@gmail.com', '2017-05-07 19:26:12'),
(15, 'aQ3djU1GrdSg9JF8CrJy6Lo71VBguD8ACABqrNLYrAxUH0DqLVSQ1R3hkQht79', 'locpnh1995@gmail.com', '2017-05-07 19:31:14'),
(16, 'gSPpMGAJqxYNFERvqmAsIPuQHkBUrJ69D7qoKtz81K9EioNoiVHxbEY9bLwtIE', 'locpnh1995@gmail.com', '2017-05-07 19:31:20'),
(17, '2hUyzkbtNKgw36urLMhyd0knFL0LupOAoSPb3XC9ldIX35dsoahdccXW1ndJBg', 'locpnh1995@gmail.com', '2017-05-07 19:32:15'),
(18, '4hTt8sLc63osFn6SLqQNIIjAlQ9fCAohEUHaMmMfAdEhsXGUuqaqhMrElLkLhk', 'locpnh1995@gmail.com', '2017-05-07 19:32:55'),
(19, '9LY5Pv8KkM2yHOBIMD6Ghec7CK3jkzWrHFFDR4Ji0YZvfKZXVlbgi4b8SFoIiq', 'locpnh1995@gmail.com', '2017-05-07 19:33:44'),
(20, 'UwchR6w34ugaM6hgOMv5SE2wwk6uqAd0dhlvSH2oJKhaFHJ3DaiYZpeT4fEmq7', 'locpnh1995@gmail.com', '2017-05-07 19:34:38'),
(21, 'tf7KyIWUHi3kpSkOczEJ3Ut15vaZda5EUvSN7jWL9sLBpEGxH9cR73pHv8wBbu', 'locpnh1995@gmail.com', '2017-05-07 19:41:44'),
(22, 'kJ01k1zlM02ET4XymUqcsnBD58kYvt3muQZqXYyIq8J3gFH5MRZPRWpEXYqafW', 'locpnh1995@gmail.com', '2017-05-07 19:51:51'),
(23, 'pDjFNKRCzerDjVeVNIeJj8Z3VWCCJjjcFoExw0mic0AGk2OOCsg8BY7pAhbIR3', 'locpnh1995@gmail.com', '2017-05-07 19:52:42'),
(24, 'o6cJqhEBkgZjk6O7nLJNEJDqqv8KhKWsnYA5wNKDlllpgJQ8ehZKPrTvAGgiKk', 'laibaoloc@yahoo.com', '2017-05-07 19:54:45'),
(25, 'mrplGSKWo8r2FKLUHdxlDRPHmTmtd2386UnL2IyC3h8GRYB7kGY1sdKAVTEEZV', 'locpnh1995@gmail.com', '2017-05-07 19:55:28'),
(26, 'swlRhiBZI8oU1RmzlAwLUMw4vmMTBnXn87qz3KWIGaFe07QzyacI6wYWNbzHoI', 'locpnh1995@gmail.com', '2017-05-07 19:56:20'),
(27, 'o6VHjOCjRt4Dp4cE2zc8T36gZYubclGlJJAp7HUt9ySVtoHEQ1ZZHsENBAxzyv', 'locpnh1995@gmail.com', '2017-05-07 19:56:46'),
(28, 'GmowW7oXMdluCBlKyOHD1zQ1B3SacViWD5BrMfPszK1yMS8Tf6VTakIQPexn5z', 'locpnh1995@gmail.com', '2017-05-07 19:57:24'),
(29, 'jOjP8laJOq4FUSUd8FbHSbRYu55IvI6fqNgVkEMy6teGiYdlRndJzzvpxhK9ma', 'locpnh1995@gmail.com', '2017-05-07 19:58:27'),
(30, 'AXXc9pbebWW87jJX5BLMSouWMMlot2sWZInQACgBcpWHkgJkVTjAhFPK03Y3dr', 'locpnh1995@gmail.com', '2017-05-07 19:59:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `first_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `algorithm` varchar(128) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'md5',
  `salt` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `username`, `algorithm`, `salt`, `password`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(3, NULL, NULL, 'locpnh1995@gmail.com', NULL, 'md5', 'f87822dbaf71e8008608ad10dd1ca5a0', '8720e2aa9ddcd9e81fb32a4f2e9e9e43', 1, NULL, '2017-05-07 18:50:11', NULL),
(4, NULL, NULL, 'laibaoloc@yahoo.com', NULL, 'md5', 'ff8ba404b0975af835c305f36df3cf6f', 'dd1e105b733ed906cdb298e3ea7b728c', 1, NULL, '2017-05-07 19:05:38', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contributors`
--
ALTER TABLE `contributors`
  ADD PRIMARY KEY (`project_id`,`user_id`),
  ADD KEY `permission_id` (`permission_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `dockers`
--
ALTER TABLE `dockers`
  ADD PRIMARY KEY (`docker_name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `docker_name` (`docker_name`);

--
-- Indexes for table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `value` (`value`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `contributors`
--
ALTER TABLE `contributors`
  ADD CONSTRAINT `contributors_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contributors_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contributors_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`docker_name`) REFERENCES `dockers` (`docker_name`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
