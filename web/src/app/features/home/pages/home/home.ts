import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { CategoryGrid } from '../../components/category-grid/category-grid';
import { ProjectsSection } from '../../components/projects-section/projects-section';
import { BenefitsSection } from '../../components/benefits-section/benefits-section';
import { FeaturedProducts } from '../../components/featured-products/featured-products';
import { AdvisorBanner } from '../../components/advisor-banner/advisor-banner';
import { TestimonialsSection } from '../../components/testimonials-section/testimonials-section';
import { BlogSection } from '../../components/blog-section/blog-section';

@Component({
  selector: 'app-home',
  imports: [
    Hero,
    CategoryGrid,
    ProjectsSection,
    BenefitsSection,
    FeaturedProducts,
    AdvisorBanner,
    TestimonialsSection,
    BlogSection,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
