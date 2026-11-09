# ALGORITHM GA :

This manifest is to guide you and me to developpe all this fucking packages for all cases in algorithm, trust god, trust genetic algorithm, only god know how it's work

## I. Selection

Two different jobs hide behind the word: picking who reproduces (*parent selection*) and picking who stays for the next generation (*survivor selection*). Most methods below can do both.

Notation: $N$ is the population size, $f_i$ the fitness of individual $i$ (bigger is better unless said otherwise), $\bar f$ and $\sigma$ the mean and standard deviation of the fitness, $p_i$ the probability of picking $i$.

The one idea that matters everywhere is **selection pressure**: how much the best individuals are favored. Too much and the population collapses on the first good solution it finds. Too little and the GA is a random search. People measure it with the *takeover time*, the number of generations the best individual needs to fill the population when only selection runs.

### 1. Fitness-proportionate selection

**Roulette wheel.** Each individual gets a slice of a wheel proportional to its fitness:

$$p_i=\frac{f_i}{\sum_{j=1}^{N} f_j}$$

Draw $r$ in $[0,\sum_j f_j)$ and walk the cumulative sums until you pass $r$. That is $O(N)$ per draw, or $O(\log N)$ with a binary search on precomputed sums.

> **In goth-mommy**: `proportional()`, the default selector of `GothMommy`. Each draw scans the scores linearly. Scores must be ≥ 0; if their sum is 0, the draw is uniform.
>
> Why that ? I dunno, he code and i'm thinking

There is a cheaper trick, *stochastic acceptance* (Lipowski & Lipowska, 2012): pick $i$ uniformly, keep it with probability $f_i/f_{\max}$, otherwise retry. Same probabilities, no cumulative sums.

**Stochastic Universal Sampling (SUS)** (Baker, 1987) fixes the real weakness of the roulette, which is noise. $N$ independent spins can, by bad luck, never pick the best individual. SUS spins once with $N$ equally spaced pointers ($r, r+\frac1N, \ldots$ with $r\in[0,\frac1N)$), so individual $i$ gets exactly $\lfloor Np_i\rfloor$ or $\lceil Np_i\rceil$ copies.

Older variants chase the same goal from the expected number of copies $e_i=f_i/\bar f$. *Remainder stochastic sampling* gives $\lfloor e_i\rfloor$ copies for sure, then fills the remaining places with the fractional parts, by roulette or by one Bernoulli draw each. The *deterministic* version just gives the remaining places to the largest fractional parts. *Expected value selection* (De Jong) keeps a counter at $e_i$ and decrements it at each pick.

**Scaling.** Raw fitness is rarely a good wheel. Early in a run, one lucky individual with ten times the average fitness eats the whole wheel. Late in the run, everybody is at 99% of the best and the wheel is flat. Scaling reshapes $f$ before the draw:

- *Linear scaling*: $f'=af+b$, chosen so the mean stays the same and the best gets $C$ times the mean, $C\in[1.2,2]$:

$$a=\frac{(C-1)\bar f}{f_{\max}-\bar f},\qquad b=\frac{\bar f\,(f_{\max}-C\bar f)}{f_{\max}-\bar f}$$

  Clip negative $f'$ to 0.
- *Sigma scaling*: $f'_i=1+\frac{f_i-\bar f}{2\sigma}$ (or 1 if $\sigma=0$), negative values set to something small like 0.1. The pressure then stays about the same for the whole run.
- *Power law*: $f'=f^k$. Pick $k$ by trial.
- *Boltzmann*: $p_i\propto e^{f_i/T}$, with $T$ going down over time like simulated annealing. It also accepts negative fitness.

The roulette is easy to write and every individual keeps a chance. But it needs $f\geq 0$ and maximization, and it is not invariant to translation: $f$ and $f+100$ give very different wheels. Without scaling, expect premature convergence early and a random walk late.

---

### 2. Rank-based selection

Sort the population, then forget the fitness values and keep only the rank $r_i$ (1 for the worst, $N$ for the best). Probabilities come from the rank, and the draw is done with a roulette or SUS on them.

The classic is **linear ranking** (Baker, 1985):

$$p_i=\frac{1}{N}\left(2-s+\frac{2(s-1)(r_i-1)}{N-1}\right),\quad s\in[1,2]$$

$s$ is the expected number of copies of the best, $2-s$ the one of the worst. $s=1$ is uniform.

If $s=2$ is still not enough pressure, go exponential:

$$p_i=\frac{(1-c)\,c^{\,N-r_i}}{1-c^{N}},\quad 0<c<1$$

The smaller $c$, the harder the push. *Geometric ranking* (Joines & Houck, 1994) is the same idea written with $q$, the probability of picking the best. Other nonlinear functions of the rank (polynomials) exist too.

Ranking does not care about the scale, the sign or the direction of the fitness, and a super-individual cannot eat the wheel. What you pay is a sort per generation, and the loss of information: a huge gap and a tiny gap between two individuals give the same probabilities.

Not the same thing as keeping the $k$ best: that is truncation (section 4).

---

### 3. Tournament selection

Pick $k$ individuals at random, keep the best, repeat for each parent. That's it, and that is why it is everywhere.

$k$ sets the pressure. With competitors drawn with replacement and individuals sorted from best ($i=1$) to worst:

$$p_i=\frac{(N-i+1)^{k}-(N-i)^{k}}{N^{k}}$$

$k=2$ (binary tournament) is the usual choice; in expectation it behaves like linear ranking with $s=2$.

> **In goth-mommy**: `tournament(size = 3)`, the default selector of `GothMommyPermutation`. Deterministic, competitors drawn with replacement. `size = 1` gives a uniform draw. Negative scores are fine.

Variants:
- *Probabilistic tournament*: the best competitor wins with probability $p\in(0.5,1]$, else the second gets the same chance, and so on (the $j$-th wins with $p(1-p)^{j-1}$, the last one with $(1-p)^{k-1}$). Gives a finer pressure knob than the integer $k$.
- *Without replacement*: the same individual cannot appear twice in one tournament.
- *Inverse tournament*: keep the **worst**, to remove it. Used in steady-state replacement.
- *Round-robin* (evolutionary programming, Fogel): each individual meets $q$ random opponents and scores a point per win; the $\mu$ best scores survive.
- *Knockout* (single elimination, like a football bracket): random pairs, winners go to the next round, until $k$ remain. Nobody is picked twice.

A tournament only needs to compare two individuals. So it works with negative scores, minimization, constraints, multiple objectives, without any sort or global sum, and it parallelizes trivially. The flip side: with replacement the best can be picked many times, and the worst almost never.

---

### 4. Truncation selection

Keep the best fraction $T$ of the population (often 10 to 50%) and draw parents uniformly among them (Breeder GA, Mühlenbein & Schlierkamp-Voosen, 1993). Each survivor gets $1/T$ copies on average. Close cousins: *top-k* (keep exactly the $k$ best, which is also how $(\mu+\lambda)$ and $(\mu,\lambda)$ pick survivors) and *threshold selection* (keep everyone above $\theta$, so the count changes every generation and can drop to 0).

It is brutal. The worst individuals never reproduce, even if they carry the one gene that was missing, and diversity goes fast.

---

### 5. Elitism

Elitism is not a selection method. It is something you bolt on top of one: copy the $E$ best individuals unchanged into the next generation ($E$ = 1, or a few % of $N$). The best fitness can then never go down.

> **In goth-mommy**: the `elitism` option, 1 by default in `GothMommy` and `GothMommyPermutation`. Elites are copied without mutation (strong elitism).
>
> We have not mesure for now this choice soooo wait to be clear

Flavors you will meet in papers:
- *strong* elitism copies the elites as is, *weak* elitism mutates them first;
- *global* elitism keeps the best of the whole population, *local* elitism keeps the best per niche, island or species, or lets a child replace its parent only if it is better;
- *archive* elitism stores the best solutions outside the population (SPEA2, PAES).

One or two elites almost always help. Ten percent of the population as elites, and they start to crowd everyone else out.

---

### 6. Random selection

$p_i=1/N$, no pressure at all. Useful as a baseline, or when the pressure comes from elsewhere: evolution strategies pick parents at random and select hard on the survivors.

Every sampling method above can draw *with replacement* (same individual several times) or *without* (shuffle, then take in order). Worth deciding on purpose.

---

### 7. Survivor selection and replacement

Once children exist, who gets to stay?

| Scheme | Who survives | Elitist? |
| :----- | :----------- | :------: |
| Generational | all children replace all parents | only with added elitism |
| Steady-state | 1 or 2 children per step replace someone (worst, random, oldest, a parent, loser of an inverse tournament) | depends on who is replaced |
| Replace worst (GENITOR) | children replace the worst, sometimes only if better | yes |
| $(\mu+\lambda)$ | best $\mu$ of parents + children | yes |
| $(\mu,\lambda)$ | best $\mu$ of the $\lambda$ children only ($\lambda>\mu$, often $\lambda\approx 7\mu$) | no |
| Family competition | children only fight their own parents (e.g. best 2 of 2 parents + 2 children) | locally |
| Age-based | anyone older than its lifetime dies, whatever its fitness | no |

> **In goth-mommy**: the engine is generational. Each generation keeps the `elitism` best individuals and fills the rest with children.

The *generation gap* $G$ is the fraction replaced per generation: $G=1$ is generational, $G=1/N$ is steady-state.

$(\mu,\lambda)$ looks wasteful but has a point. A good parent is forgotten after one generation, so the population can walk away from a local optimum. It also makes self-adaptive mutation work: an individual with a bad step size cannot live on an old lucky fitness.

**ALPS** (Hornby, 2006) pushes the age idea further. The population is cut into layers by age (the age of the oldest genetic material in an individual). Individuals only compete inside their layer and move up when they get too old for it. Fresh random individuals keep arriving at the bottom, so the run never fully stagnates.

---

### 8. Diversity-preserving selection (niching)

The goal here is to keep several groups of solutions alive in different regions (*niches*), either to avoid premature convergence or because you actually want several optima.

Everything in this section needs a distance $d_{ij}$ between individuals: on the chromosomes (Hamming, Euclidean), on the decoded solutions, or on their behavior. Choosing it is most of the work, and most methods cost $O(N^2)$ distance computations.

**Fitness sharing** (Goldberg & Richardson, 1987) divides each fitness by how crowded its neighborhood is:

$$f'_i=\frac{f_i}{\sum_{j=1}^{N}\text{sh}(d_{ij})},\qquad \text{sh}(d)=\begin{cases}1-\left(\dfrac{d}{\sigma_{\text{share}}}\right)^{\alpha} & \text{if } d<\sigma_{\text{share}}\\[4pt] 0 & \text{otherwise}\end{cases}$$

then runs a proportional selection on $f'$. $\sigma_{\text{share}}$ is the niche radius and it is the parameter you will get wrong first.

The other methods, in short:
- **Clearing** (Pétrowski, 1996): in each niche of radius $\sigma$, only the $\kappa$ best keep their fitness, the rest drop to 0. Stronger and cheaper than sharing.
- **Crowding** (De Jong, 1975): a child replaces the most similar of $CF$ random individuals ($CF$ = 2 or 3).
- **Deterministic crowding** (Mahfoud, 1992): each child is paired with its closest parent and replaces it if better.
- **Probabilistic crowding**: same pairing, the child wins with probability $f_{\text{child}}/(f_{\text{child}}+f_{\text{parent}})$.
- **Restricted tournament selection** (Harik, 1995): a child is compared with the closest of $w$ random individuals and replaces it if better.
- **Speciation**: individuals join the first species whose representative is closer than $\delta$, mate inside it, and share fitness as $f_i/|S_i|$. This is what NEAT does.
- **FUSS** (Hutter, 2002): draw a fitness value uniformly in $[f_{\min},f_{\max}]$ and take the individual closest to it. Rare fitness levels get favored.
- **Novelty search** (Lehman & Stanley, 2008): drop the fitness and reward being different. The score is the mean distance to the $k$ nearest neighbors in behavior space (population + archive): $\rho(x)=\frac1k\sum_{j=1}^{k}d(x,\mu_j)$. Surprisingly good on deceptive problems.

---

### 9. Multiobjective selection

With $M$ objectives to minimize, $a$ **dominates** $b$ ($a\prec b$) when $a$ is never worse and at least once strictly better:

$$a\prec b \iff \forall m,\ f_m(a)\leq f_m(b)\ \text{ and }\ \exists m,\ f_m(a)<f_m(b)$$

The non-dominated solutions form the **Pareto front**. A good selection pushes toward the front and spreads along it at the same time.

The basic tool is **non-dominated sorting** (Goldberg, 1989): the non-dominated individuals are front 1; remove them, the next non-dominated ones are front 2, and so on. MOGA (Fonseca & Fleming, 1993) uses instead 1 + the number of individuals that dominate you. NSGA (Srinivas & Deb, 1994) adds fitness sharing inside each front.

**NSGA-II** (Deb et al., 2002) is the one to know:
1. Merge parents and children ($2N$ individuals).
2. Sort them into fronts ($O(MN^2)$).
3. Fill the next population front by front.
4. The last front that does not fit is cut by *crowding distance*: sort it on each objective, then

$$d_i=\sum_{m=1}^{M}\frac{f_m(i+1)-f_m(i-1)}{f_m^{\max}-f_m^{\min}}$$

   with $d=\infty$ for the extremes. Larger $d$ means a lonelier, more useful individual.
5. Parents are picked by binary tournament: lower front wins, then larger crowding distance.

Past 3 objectives, almost everybody is non-dominated and crowding distance stops meaning much. **NSGA-III** (Deb & Jain, 2014) replaces it with reference points spread on a normalized hyperplane (Das-Dennis) and keeps every reference direction represented.

**SPEA2** (Zitzler et al., 2001) gives each individual a fitness to minimize, $F(i)=R(i)+D(i)$. $R(i)$ sums the strengths (number of dominated individuals) of everyone who dominates $i$. $D(i)=1/(\sigma_i^k+2)$ uses the distance to the $k$-th nearest neighbor. A fixed-size external archive keeps the non-dominated solutions.

**MOEA/D** (Zhang & Li, 2007) takes a different road: split the problem into $N$ scalar sub-problems, one weight vector $\lambda$ each, and optimize each one with its neighbors. The scalarizing function matters:
- weighted sum $g=\sum_m\lambda_m f_m$ cannot reach non-convex parts of the front;
- Tchebycheff $g=\max_m \lambda_m|f_m-z_m^*|$ can ($z^*$ is the ideal point);
- Wierzbicki's achievement function adds a small $\rho\sum_m\lambda_m(f_m-z_m^{\text{ref}})$ term to avoid weakly optimal points.

Also around: PAES (a $(1+1)$-ES with an archive and an adaptive grid), the niched Pareto tournament (Horn et al., 1994: two candidates against a random comparison set, ties broken by niche count), $\epsilon$-dominance for bounded archives, and indicator-based methods. IBEA uses a binary indicator such as $I_{\epsilon+}$. SMS-EMOA removes the individual that contributes least to the hypervolume: the hypervolume respects Pareto dominance, but its exact computation is exponential in $M$.

---

### 10. Spatially structured selection

Instead of letting everyone meet everyone, restrict who can meet whom. Good genes then spread slowly, and diversity lasts longer.

In a **cellular GA** (diffusion model), individuals sit on a grid, often a torus, and pick mates in their neighborhood only (von Neumann: 5 cells, Moore: 9), usually with a local tournament. In an **island model**, the population is split into sub-populations (islands, demes) that evolve alone and exchange $m$ migrants every $\Delta$ generations along a topology (ring, grid, full). The *stepping-stone* model only allows migration between neighbor islands. Hierarchical versions stack islands in levels: in HFC (Hu & Goodman, 2002) each level holds a fitness range and individuals climb when they pass its threshold.

Islands map naturally to processors, and each island can run its own parameters. The catch is the migration settings: migrate too much and you get one big population again, too little and you just ran $I$ independent GAs.

---

### 11. Adaptive selection

The pressure does not have to stay fixed. You can follow a schedule (increase $k$, lower $T$ over the generations), react to the search (lower the pressure when diversity drops, measured for example by the entropy $H=-\sum_c p_c\log p_c$ of gene values), or encode the parameter in the chromosome and let it evolve.

A related but different problem is **adaptive operator selection**, which chooses *operators*, not individuals. Each of the $K$ operators has a quality $q_i$ updated from the improvements it produces:
- *probability matching*: $p_i=p_{\min}+(1-Kp_{\min})\,q_i/\sum_j q_j$;
- *adaptive pursuit* (Thierens, 2005): push the best operator toward $p_{\max}=1-(K-1)p_{\min}$ and the others toward $p_{\min}$, with a learning rate $\beta$;
- *multi-armed bandit* (UCB1): pick the operator that maximizes $q_i+C\sqrt{2\ln(\sum_j n_j)/n_i}$, $n_i$ being its number of uses.

Less hand tuning, but new parameters ($\beta$, $p_{\min}$, $C$) and a noisy feedback signal.

---

### 12. Constraint- and criteria-based selection

**Feasibility rules** (Deb, 2000) are the simplest way to handle constraints, and need no parameter. In a binary tournament:
1. feasible beats infeasible;
2. two feasible: better fitness wins;
3. two infeasible: smaller violation wins.

They can throw away infeasible solutions sitting right next to the optimum, though.

The alternative is a **penalty**, $f'(x)=f(x)+\sum_j r_j\max(0,g_j(x))^2$ for constraints $g_j(x)\leq 0$, followed by any selection. The $r_j$ can be static, grow with time, or adapt. Tuning them is the classic headache. **Stochastic ranking** (Runarsson & Yao, 2000) sidesteps it: a bubble-sort pass compares neighbors on the objective if both are feasible or with probability $P_f\approx 0.45$, else on the violation.

When the score is a list of things rather than one number:
- **Lexicographic** selection compares on the first objective, then the second on ties, and so on.
- **Lexicase** selection (Spector, 2012) is now a standard in genetic programming. For each pick, shuffle the test cases, keep only the candidates that are best on the first case, then on the next, until one remains. Specialists that an average would kill survive. Variants: $\epsilon$-lexicase for real errors (automatic $\epsilon$ = median absolute deviation on the case), down-sampled lexicase (a random subset of cases per generation), batch lexicase (cases grouped). Cost: $O(N\times\text{cases})$ per pick.
- **AFPO** (Schmidt & Lipson, 2011) runs a Pareto selection on (fitness, age) and adds one random newborn per generation, so young solutions are not crushed by old good ones. The same trick works with (fitness, novelty).

---

### 13. Hybrid selection

In practice, people mix:
- elitism + tournament or roulette (the default almost everywhere);
- truncation, then tournament or uniform draw among the survivors;
- rank probabilities sampled with SUS;
- tournament on a scaled or shared fitness;
- successive filters: feasibility, then Pareto rank, then crowding, which is exactly NSGA-II;
- low pressure early (roulette, random) and high pressure late (big $k$, truncation);
- one method for parents, another for survivors.

Each piece covers a weakness of another: elitism keeps the best solution that a soft roulette could lose. But the combined pressure gets hard to reason about.

---

### Summary

| Method | Pressure parameter | Sort | Negative fitness / minimization | Cost per selection |
| :----- | :----------------- | :--: | :-----------------------------: | :----------------- |
| Roulette wheel | none (scaling) | no | no | $O(N)$ or $O(\log N)$ |
| SUS | none (scaling) | no | no | $O(N)$ for $N$ selections |
| Linear ranking | $s\in[1,2]$ | yes | yes | $O(N\log N)$ sort |
| Exponential ranking | $c\in(0,1)$ | yes | yes | $O(N\log N)$ sort |
| Tournament | $k$, $p$ | no | yes | $O(k)$ |
| Truncation | $T$ | yes | yes | $O(N\log N)$ sort |
| Boltzmann | $T$ | no | yes | $O(N)$ |
| Uniform random | none | no | yes | $O(1)$ |

## II. Encoding

The encoding decides what a chromosome *is*, and from there which operators make sense. Get it wrong and no amount of tuning saves the run: a crossover that cannot keep a child valid, or a mutation that jumps across the whole search space, will fight you forever.

### 1. Binary encoding

The oldest one, from Holland's GAs. A chromosome is a string of 0s and 1s, one bit per gene. It is the natural choice for yes/no decisions (take an item or not, turn an option on or off), and every classical operator works on it: single-point, two-point and uniform crossover, bit-flip mutation.

It can also carry a real number. $L$ bits encode $x\in[x_{\min},x_{\max}]$ as

$$x = x_{\min} + \frac{\text{int}(b)}{2^{L}-1}\,(x_{\max}-x_{\min}),\qquad \Delta x = \frac{x_{\max}-x_{\min}}{2^{L}-1}$$

where $\text{int}(b)$ is the integer value of the bits and $\Delta x$ the resolution you get. That is where the trouble starts. Precision costs bits, and the bit neighborhood is not the number neighborhood: 7 = `0111` and 8 = `1000` differ by 4 bits (a *Hamming cliff*), while flipping the top bit jumps half the range.

**Gray code** fixes the cliff: two consecutive values always differ by exactly one bit.

$$g_{0}=b_{0},\quad g_{i}=b_{i-1}\oplus b_{i}\qquad\text{and back:}\qquad b_{0}=g_{0},\quad b_{i}=b_{i-1}\oplus g_{i}$$

On an integer: `g = b ^ (b >> 1)`. 7 becomes `0100`, 8 becomes `1100`: one bit apart. So a ±1 step is always one flip away. The converse is false, though: one flip can still land far away, and Gray code does not guarantee faster convergence. It costs a decoding step.

**Integers in binary.** With $L$ bits, an unsigned integer covers $[0, 2^{L}-1]$. For signed values, pick a convention: sign-magnitude, one's complement, two's complement (range $[-2^{L-1}, 2^{L-1}-1]$, the one CPUs use), or simply an offset (store $x-x_{\min}$). Annoying detail: if your range is not a power of 2, some bit patterns are invalid and need a repair.

**BCD** (binary-coded decimal) puts each decimal digit on 4 bits: 1234 is `0001 0010 0011 0100`. Exact decimals, but codes `1010` to `1111` are invalid and operators will produce them. Rarely worth it.

---

### 2. Number Encoding
**a. Integer encoding**

Each gene is an integer, stored as is (no bits).

$$G=[x_1,x_2,\ldots,x_n],\quad x_i\in\mathbb{Z},\quad l_i \leq x_i \leq u_i$$

Mutation:
- *Random reset*: draw another valid value.
- *Creep*: add or subtract a small step.
- *Uniform*: draw anywhere in $[l_i,u_i]$.

Crossover: single-point, two-point and uniform work as is. Arithmetic or blend crossover need a rounding step:

$$C=\text{round}\big(\alpha P_1+(1-\alpha)P_2\big),\quad \alpha\in[0,1]$$

The rounded child can still break a constraint of the problem (an odd number where only even ones are valid, for example).

> **In goth-mommy**: `int(min, max)`. After crossover or mutation, `fit()` rounds and clamps the value. A mutation always moves an integer by at least ±1 (`intStep`): without it, a small Gaussian noise rounds to 0 and the gene never changes.

---

**b. Real-valued encoding**

Genes are real numbers, for continuous variables (coefficients, ratios, dimensions, temperatures, speeds, setpoints...). No decoding: the gene is the variable.

$$G=[x_1,x_2,\ldots,x_n],\quad x_i\in\mathbb{R},\quad l_i \leq x_i \leq u_i$$

Crossover:
- Arithmetic crossover: $C=\alpha P_1+(1-\alpha)P_2$.
- BLX-α (Blend crossover): the child is drawn uniformly in $[\min(p_1,p_2)-\alpha d,\ \max(p_1,p_2)+\alpha d]$ with $d=|p_1-p_2|$.
- SBX (Simulated Binary Crossover): imitates the spread of a single-point binary crossover on real values.
- Single-point, two-point and uniform crossover.

Arithmetic, BLX-α and SBX create new values between or around the parents. Single-point, two-point and uniform crossovers only swap existing values, so they never create a new one.

Mutation:
- Gaussian mutation: $x' = x + \mathcal{N}(0,\sigma^2)$.
- Uniform mutation within the bounds.
- Polynomial mutation (usually paired with SBX).
- Non-uniform mutation (amplitude decreasing over generations).

Two things bite in practice. A mutation can leave the bounds, so you clamp, reflect or repair. And $\sigma$ depends on the scale of each variable: one $\sigma$ for a gene in $[0,1]$ and a gene in $[0,10^4]$ does not work.

> **In goth-mommy**: `real(min, max)`, unbounded by default. Two mutators: `gaussian({ sigma })` and `perturb({ strength })`. `perturb` draws a uniform noise whose amplitude goes from ±`strength` down to ±`strength`/1000, so the same mutator makes large jumps and fine adjustments near the optimum. `arithmetic()` is the crossover that creates new real values.
>
> In future, maybe we change it

---

**c. Floating-point encoding**

This is how real-valued genes are stored in practice: IEEE 754 numbers, `float32` (about 7 significant digits) or `float64` (about 15-16). A JavaScript `number` is a `float64`.

$$x = (-1)^{s}\times 1.m \times 2^{e-\text{bias}}$$

Operators are those of 2.b. What changes is the rounding: `0.1 + 0.2 !== 0.3`. In a GA, this matters for equality constraints (use a tolerance), for fitness comparisons between nearly equal individuals, and for `NaN` or `Infinity` produced by the fitness function (a `NaN` score breaks any comparison-based selection).

---

**d. Fixed-point encoding**

The value is an integer with a fixed scale $S$:

$$x_{\text{real}}=\frac{x_{\text{integer}}}{S}$$

With $S=100$ (two decimals), 12.34 is stored as 1234. With a signed integer of $L$ bits, the range is $\left[\frac{-2^{L-1}}{S}, \frac{2^{L-1}-1}{S}\right]$.

Operators are those of integer encoding (2.a), or bitwise operators on the stored integer.

Useful on microcontrollers without a floating-point unit, or when every machine must give exactly the same result. Otherwise, floating-point is simpler. Watch out for overflow.

---

**e. Mixed-integer encoding**

A single chromosome mixes integer and real genes, for problems with both discrete and continuous decisions (how many machines, and at what speed).

$$G=[x_1,x_2,x_3,x_4],\quad x_1\in\mathbb{Z},\quad x_2\in\mathbb{R},\quad x_3\in\mathbb{Z},\quad x_4\in\mathbb{R}$$

Each gene is mutated according to its type: $x'_1=x_1+\delta$ with $\delta\in\mathbb{Z}$, $x'_2=x_2+\epsilon$ with $\epsilon\in\mathbb{R}$. A mutation can turn $[8,\ 75.5,\ 24,\ 120.75]$ into $[9,\ 76.2,\ 24,\ 118.4]$: the integers stay integers.

Crossover works per type too: SBX or arithmetic on the reals, a discrete crossover on the integers. Single-point, two-point and uniform crossover work on every type.

The hard part is not the encoding, it is the dependencies between genes: if $x_1$ is the number of machines and $x_2,x_3,\ldots$ their speeds, changing $x_1$ changes the meaning of the rest. That needs a repair step or a variable-length encoding (section 5).

> **In goth-mommy**: this is the main encoding. An individual is a `HyperParams` object, and the `Space` gives each key its type: `real`, `int`, `bool` or `choice`. Without a `Space`, it is inferred from the seed (number = unbounded real, boolean = bool, string = constant). `mutateGenes` adds noise to `real` and `int` genes, and flips `bool` and `choice` genes with probability `flipRate`. `arithmetic()` mixes numeric genes and takes each other gene from either parent, by coin flip.

---

### 3. Permutation Encoding

When the answer is an *order* (a tour, a schedule, a sequence of tasks), the chromosome is a permutation: every element appears exactly once.

$$G=[x_1,x_2,\ldots,x_n]\in S_n,\qquad |S_n| = n!$$

Example for 5 cities: $[3,1,4,5,2]$.

The first thing you learn is that classical crossovers break it. Single-point crossover after position 2 of $[1,2,3,4,5]$ and $[3,1,4,5,2]$ gives $[1,2,4,5,2]$: 2 twice, 3 gone. So permutations come with their own operators.

Crossovers: PMX (partially mapped), OX (order), CX (cycle), ERX (edge recombination), plus position-based, order-based and alternating-position variants. Mutations: swap, insertion, inversion, scramble, displacement. All of them return a valid permutation.

> **In goth-mommy**: `GothMommyPermutation` evolves permutations of `0..size-1`. Crossovers: `ox()` (default, keeps the relative order) and `pmx()` (keeps the positions). Mutations: `swap()` (default) and `inversion()`. Every operator returns a valid permutation, so no repair is needed.
>
> We have some trust issue in this code isn't it ?

The search space is $n!$: 20 cities is already $2.4\times 10^{18}$ tours.

There are other ways to store an order, each trading something:

**Ordinal (Lehmer code).** For each position, count the smaller elements to its right. $[3,1,4,5,2]$ gives $[2,0,1,1,0]$ (3 has 1 and 2 on its right, 1 has nothing smaller, and so on). It is close to, but not the same as, the *inversion table* (Knuth), which counts for each value the larger elements on its left: the two are linked by the inverse permutation.

To decode, start from $L=[1,2,3,4,5]$ and, for each code $c_i$, take out the element at index $c_i$ (from 0): 3, 1, 4, 5, 2.

Gene $i$ (counted from 1) lives in $[0, n-i]$, so for five elements: $c_1\in[0,4]$, $c_2\in[0,3]$, $c_3\in[0,2]$, $c_4\in[0,1]$, $c_5=0$. The nice part: genes never move, so single-point, two-point and uniform crossover always produce a valid permutation. The bad part: heritability is poor, because changing $c_i$ changes the meaning of every gene after it. Children of ordinal crossovers can look nothing like their parents.

> [!CAUTION]
> Any operator that moves a gene to another position, or that changes its value (mutation, arithmetic crossover without rounding), must keep $c_i$ in $[0, n-i]$, otherwise the code is invalid.

**Ranking.** Gene $i$ is the rank of element $i$, which is the inverse of the permutation above. $[A,B,C,D,E]$ with $[3,1,5,2,4]$ reads $B\prec D\prec A\prec E\prec C$. Permutation operators work as long as ranks stay unique; allow ties and you are doing priority encoding (section 12). Not to be confused with rank-based *selection*, which ranks individuals, not genes.

**Random keys.** One real key per element, usually in $[0,1)$; sort the indices by key to get the order. $[0.42,\ 0.07,\ 0.91,\ 0.33,\ 0.65]$ sorts as $0.07\,(2), 0.33\,(4), 0.42\,(1), 0.65\,(5), 0.91\,(3)$, so the permutation is $[2,4,1,5,3]$. Here is the trick: *every* vector decodes to a valid permutation. Any real-valued operator works with no repair, and keys mix easily with other real genes. This is the basis of BRKGA (Biased Random-Key GA). The cost is a sort per decode ($O(n\log n)$), a tie-breaking rule for equal keys, and a lot of redundancy (infinitely many vectors give the same order).

---

### 4. Symbolic Encoding

Genes taken from a finite alphabet $\Sigma$ of symbols instead of numbers: $G=[s_1,\ldots,s_n]$, $s_i\in\Sigma$.

The textbook case is **characters**: evolve `"HELLO WORLD"` from random strings over printable ASCII. Classical crossovers work (no duplicate constraint), mutation replaces a character by another one from $\Sigma$. Restrict the alphabet when the problem does: letters only, or $\{A,C,G,T\}$ for DNA. The weakness is that characters have no distance: `A` is not closer to `B` than to `Z` as far as the problem is concerned, and the space grows as $|\Sigma|^n$.

**Categorical** genes are the same idea with one set of options per gene, and no order inside a set:

$$G=[c_1,\ldots,c_n],\quad c_i\in C_i$$

Example: $[\text{steel},\ \text{round},\ \text{supplier B}]$ with $C_1=\{\text{steel},\text{aluminium},\text{wood}\}$, $C_2=\{\text{round},\text{square}\}$, $C_3=\{\text{A},\text{B},\text{C}\}$. Categories are often stored as integer indices, but never treat these indices as numbers: no arithmetic crossover, no creep mutation. Only swap values between parents and reset within $C_i$. Watch out for combinations that make no sense together (repair or penalty). This is what optimizer or activation-function choices look like in hyperparameter search.

> **In goth-mommy**: `choice(values)`. With probability `flipRate`, mutation picks another value from the list (never the current one). `bool()` is the two-value case.

**Meaningful symbols** (functions, variables, constants, instructions) turn a linear chromosome into a program. $[+,\ x,\ \times,\ 3,\ y]$ can be decoded as $x+3\times y$. Gene Expression Programming (GEP) splits the chromosome into a *head* (functions and terminals) and a *tail* (terminals only), which guarantees that every chromosome decodes to a valid expression. Mutation must replace a function by a function and a terminal by a terminal.

---

### 5. String and Sequence Encoding

A string over $\Sigma$ ($G = s_1 s_2 \ldots s_n$) is the general form; binary and character encodings are special cases. A *sequence* adds that order matters and elements can repeat, unlike a permutation: robot moves $[\text{UP},\ \text{LEFT},\ \text{LEFT},\ \text{DOWN}]$ are evaluated by running them.

What really splits this family is the length.

- **Fixed length**: every chromosome has $n$ genes, and gene $i$ always means the same thing. Classical operators apply directly.
- **Variable length**: $n_G$ changes between individuals and over time. You need *cut-and-splice* crossover (a different cut point in each parent, so children have different lengths), insertion and deletion mutations, segment duplication. You do not have to know the size of the solution in advance, which is the whole point. But chromosomes tend to grow without getting better (*bloat*), so set a length limit or a length penalty from day one. Aligning genes between parents also gets hard.

---

### 6. Tree Encoding

Genetic programming (Koza) evolves trees. Internal nodes come from a function set $F$, leaves from a terminal set $T$ (variables, constants). $(x+3)\times\sin(y)$ is:

```
        ×
       / \
      +   sin
     / \    \
    x   3    y
```

and is evaluated by a recursive walk. When the tree follows a grammar (each internal node a rule, each leaf a token), it is a *parse tree* and every program is syntactically valid by construction.

Two requirements:
- **Closure**: every function accepts whatever any function or terminal returns. Hence "protected division", $x/0=1$.
- **Sufficiency**: $F$ and $T$ can express a solution at all.

Initialization is usually *ramped half-and-half*: half the trees *full* (every branch at max depth), half *grow* (random depths), over a range of depths.

Operators: subtree crossover (swap two random subtrees), subtree mutation (replace one by a new random subtree), point mutation (same-arity node swap), hoist (keep only a subtree), shrink (replace a subtree by a terminal).

You get optimized structure, not just parameters, and a formula you can read at the end. You also get bloat (depth limits and parsimony pressure are mandatory), slower evaluation than a vector, and fragile roots: a small change near the root changes everything below.

---

### 7. Graph Encoding

For a graph $\mathcal{G}=(V,E)$, the question is just how to store it.

| Storage | Chromosome | Good | Bad |
| :------ | :--------- | :--- | :-- |
| Adjacency matrix | $n\times n$ bits, $a_{ij}=1$ if edge (or weight); upper triangle only if undirected, $\frac{n(n-1)}{2}$ bits | fixed length, binary operators work | $n^2$ size, crossover breaks connectivity |
| Adjacency list | neighbors of each node, e.g. $1:[2,3],\ 2:[3],\ 3:[1]$ | compact for sparse graphs | variable length, custom operators |
| Edges | one bit per candidate edge, or a list of chosen edges | simple | validity (connected? tree?) not guaranteed |
| Nodes | one label per node, e.g. colors $c_i\in\{1,\ldots,k\}$ | direct for coloring, clustering | says nothing about edges |
| Path | nodes visited from source to target, $[s,\ 4,\ 7,\ 2,\ t]$ | direct for routing | consecutive pairs must be edges; cross at a shared node, repair the rest |

For spanning trees, the **Prüfer code** is worth knowing: $n-2$ genes in $[1,n]$, and every chromosome decodes to a valid tree.

---

### 8. Matrix Encoding

When the problem has two indices (task × machine, source × destination, pixel rows × columns), keep them: the chromosome is an $m\times n$ matrix $M=(x_{ij})$.

The operators are what make it worth it: swap whole rows or columns, or a rectangular block, between parents. Flattening and using classical operators works too, but loses the 2D neighborhood.

The cells can be:
- **bits**: $x_{ij}=1$ if task $i$ goes to machine $j$, or black-and-white pixels. Constraints like "exactly one 1 per row" break as soon as you cross, so plan specific operators or a repair;
- **reals**: a neural network weight matrix, transport quantities from $i$ to $j$. Real-valued operators apply cell by cell;
- **a permutation matrix**: exactly one 1 per row and per column. It is just a permutation stored in $n^2$ cells instead of $n$, so use section 3 instead.

---

### 9. Set Encoding

Sometimes only membership matters: which items go in the knapsack, which features the model uses, where to build facilities. Order is noise here, and storing it creates useless duplicates.

A **set** $G=\{e_1,\ldots,e_k\}\subseteq U$ needs set operators: keep $P_1\cap P_2$ in the child, fill up from $P_1\cup P_2$ to the required size; mutate by adding, removing or replacing an element.

A **subset** of $n$ items is usually a bit vector (bit $i$ = item $i$ is in), or a list of $k$ indices without duplicates if $k$ is fixed. A **multiset** (repeats allowed) is a count vector $[m_1,\ldots,m_n]$, $m_i\in\mathbb{N}$, so really integer encoding.

Capacity constraints (the knapsack weight) are the usual pain: repair or penalty.

---

### 10. Vector Encoding

Not really a separate encoding. A fixed-length vector $G=[x_1,\ldots,x_n]$ where gene $i$ always means the same thing is what most of the above already is: bits (section 1), reals (2.b), integers (2.a), or a mix (2.e).

---

### 11. Rule-based Encoding

The chromosome holds rules like

$$\text{IF } \text{condition}_1 \land \text{condition}_2 \land \ldots \text{ THEN } \text{conclusion}$$

for example `IF temperature > 30 AND humidity < 40 THEN irrigate`. For each attribute, the genes say whether it is tested and against which value or interval.

The big design choice is what one individual is:
- **Pittsburgh**: a whole rule set. Fitness judges the set, crossover swaps whole rules, and the number of rules varies.
- **Michigan**: one rule. The population *is* the rule set. This is learning classifier systems (XCS).

XCS conditions use the ternary alphabet $\{0,1,\#\}$, where $\#$ is "don't care": `01#1 : 10` matches `0101` and `0111` and fires action `10`. Mutation flips a condition symbol or the action.

The result is readable, which is rare: a human can check each rule. Expect conflicting and redundant rules, and costly fitness (every rule set is evaluated on the whole dataset).

---

### 12. Specialized Encoding

Real problems rarely use a pure encoding. Most of these reuse one from above with a dedicated decoder.

**Scheduling.** You can store start times directly, a sequence of operations, or one dispatching rule (SPT, EDD...) per step. Or store a *priority* per task and let a decoder always schedule the highest available one first. That is close to random keys.

**Job-shop** uses a permutation with repetitions: each job $j$ appears $m$ times (one per machine), and the $k$-th occurrence of $j$ is its $k$-th operation. With 3 jobs and 2 machines, $[1,2,1,3,2,3]$. Every chromosome decodes to a feasible schedule, as long as crossovers keep exactly $m$ copies of each job.

**Assignment**: $a_i\in\{1,\ldots,m\}$ is the machine, worker or vehicle given to task $i$. Several tasks can share one; if it is one-to-one, it is a permutation.

**Routing.**
- *TSP*: almost always the path representation (the permutation in visiting order). There is also the adjacency form (gene $i$ = the city after $i$) and the ordinal one (Lehmer code).
- *VRP*: customers with depot separators ($[3,1,0,4,2,0,5]$), or a *giant tour* without separators that a decoder cuts into routes.

**Resource allocation**: $\sum_i x_i = R$, $x_i\geq 0$. After each operator, renormalize ($x_i \leftarrow R\cdot x_i/\sum_j x_j$) or repair.

**Partitions** of $n$ elements into $k$ groups. *Group numbers* ($g_i$ = group of $i$) are simple but redundant: renaming the groups gives $k!$ chromosomes for the same partition. Falkenauer's *grouping* encoding works on whole groups instead.

**Boolean functions**: a truth table ($2^n$ bits for $n$ inputs), or an expression tree of `AND`, `OR`, `NOT`, `XOR`, which stays compact when $n$ grows.

**Neural networks** (neuroevolution):
- *Weights only*: the architecture is fixed and the chromosome is every weight and bias, flattened. Real-valued operators just work, but chromosomes are huge. There is also the *permutation problem*: two networks computing the same thing with hidden neurons in a different order make crossover destructive.
- *Architecture*: layers, neurons, connections, activations. NEAT stores node genes and connection genes, and gives each connection an *innovation number* so crossover can line up the genes of two different topologies.

**Hyperparameters** are a mixed vector (2.e):

$$[\text{learning rate} \in [10^{-5},10^{-1}]\ (\text{real, log scale}),\ \text{layers} \in [1,8]\ (\text{integer}),\ \text{activation} \in \{\text{relu},\text{tanh}\}\ (\text{categorical})]$$

Wide ranges like the learning rate belong on a log scale.

> **In goth-mommy**: this is what `GothMommy` is built for (see 2.e). There is no log-scale gene: evolve the exponent instead, e.g. `real(-5, -1)`, and use `10 ** x` in the scoring function.
>
> I have use this kind of encoding in my project (trading-model) and I think (i haven't mesure yet) this is a good idea for explore the possibility for resolve complexe mlp architecture and optimise the number of layer/neuronnes without passing 100k of iterations

---

### 13. Indirect / Generative Encoding

Everything so far is *direct*: the chromosome is the solution. Here, the genotype is a recipe, and a construction process builds the solution (the phenotype) from it. A short recipe can describe something huge and regular, because a rule can be reused many times: repetition, symmetry and modules come for free. The price is that a tiny change in the recipe can change the result completely, and decoding can be slow.

The main families:
- **Developmental**: grow the phenotype from a seed (one cell) by applying division and differentiation rules over several steps, like an embryo. *Cellular encoding* (Gruau) is the classic: a tree of cell instructions (divide in sequence, divide in parallel, change a weight...) that grows a neural network.
- **Grammatical Evolution**: the chromosome is a vector of integers (*codons*) choosing productions of a BNF grammar. At each step the leftmost non-terminal is expanded with rule $= \text{codon} \bmod \text{number of choices}$. With `<e> ::= <e>+<e> | <e>*<e> | x | 1`, codon 6 gives $6 \bmod 4 = 2$, so `<e>` becomes `x`. Any integer vector yields a valid program; if codons run out, wrap around or penalize.
- **L-systems**: the genome is an axiom plus rewriting rules applied to all symbols in parallel for $k$ iterations. Axiom `F` with `F -> F[+F]F[-F]F` draws a plant after a few rounds.
- **CPPN** (compositional pattern-producing network): a small network of functions (sine, Gaussian, sigmoid, linear...) queried at every coordinate, $\text{value} = \text{CPPN}(x, y)$. The output is a pattern full of symmetries and repetitions. Usually evolved with NEAT.
- **HyperNEAT** queries a CPPN with the coordinates of two neurons on a geometric *substrate*, $w_{ij} = \text{CPPN}(x_i, y_i, x_j, y_j)$, and uses the output as their connection weight. A tiny CPPN can then encode a very large, regular network.

---

### 14. Hybrid Encoding

Sooner or later a problem has parts that want different encodings. Flexible job-shop is the usual example: which machine does each operation (integers), and in what order (permutation with repetition).

The simplest way is a **composite** chromosome, segments glued together, each with its own operators, applied segment by segment:

$$G = [\underbrace{x_1,\ldots,x_k}_{\text{real}} \mid \underbrace{\pi_1,\ldots,\pi_m}_{\text{permutation}} \mid \underbrace{b_1,\ldots,b_p}_{\text{binary}}]$$

Other shapes:
- **hierarchical**: upper genes switch lower genes on or off (an "active layer" gene decides whether that layer's parameters are used at all);
- **modular**: reusable blocks defined once and called several times, like automatically defined functions (ADFs) in GP;
- **nested**: a gene that is itself a vector, tree or permutation. In bilevel optimization, the outer chromosome picks a structure and each gene holds the parameters of one part;
- **multi-representation**: the same solution kept in two forms (permutation and random keys), or sub-populations with different encodings that translate solutions to trade them.

Each part gets the encoding that fits it. In exchange, you write and tune operators for every part, and the parts can combine into invalid solutions.

---

## III. Crossover
### 1. Single-Point or Multi-Point Crossover
**a. Single-Point Crossover**
This is the classic, the one you'll find in pretty much every demo. It works simply.
Chromosomes (see II. Encoding) are strings of **fixed** length $L$.
* We select parents (see I. Selection) and run a probability test ($P_c$) on them:
Crossover is not systematic (same goes for every method in this section, so I won't repeat myself, tough luck for the three devs dozing off in the back row). We set a crossover rate, usually between 0.6 and 0.9. If a random number falls below this rate, crossover happens. Otherwise, the kids are carbon copies of Mommy and Daddy.
* If crossover does happen, we pick a random index $k$ between 1 and $L-1$. This index cuts the chromosome into two parts: the "head" and the "tail". Yes, head. Yes, tail. No comment for the devs with dirty minds, I know you're there.
* With this head and tail, we perform a *swap*. Sorry to disappoint, but nobody is giving head here, we're just trading it:
    * **Child 1** takes the head from Parent 1 and the tail from Parent 2.
    * **Child 2** does the opposite: head from Parent 2, tail from Parent 1.


IV. Mutation 
V. Fitness
VI. Initialise the population
