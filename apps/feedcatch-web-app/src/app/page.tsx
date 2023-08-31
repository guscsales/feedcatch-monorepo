import ListFoodsCards from '@web/app/foods/components/list-foods-cards';

export default async function Index() {
  return (
    <section className="container mt-5">
      <h1 className="text-xl font-bold mb-5">Choose your foods</h1>

      <ListFoodsCards />
    </section>
  );
}
